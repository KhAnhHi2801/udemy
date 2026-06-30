/**
 * Scans pages/ and components/ source files (this is a Next.js Pages Router app) for
 * i18next t('...') calls (e.g. t('Save changes')) — the raw natural-language text
 * passed to t() is what gets shown to users and looked up in the "common" namespace
 * at public/locales/<lang>/common.json at runtime (per next-i18next.config.js). This
 * script only manages that "common" namespace; "errors" is keyed by backend error
 * codes (e.g. SOMETHING_WENT_WRONG) and is maintained by hand. This script:
 *   1. Finds those raw text strings, generates a slug key for each (e.g. "save-changes")
 *   2. Replaces the raw text inside t(...) in source files with the generated key
 *   3. Auto-translates each key's text into every locale via Google's Generative
 *      Language API (Gemini) and writes the results into public/locales/<lang>/common.json
 *
 * Usage: node scripts/generate-translations.cjs [files...] [--force] [--clean-up]
 *   (no args)    walk pages/ and components/ and update all source + locale files
 *   files...     only process the given source files
 *   --force      re-translate keys even if already translated
 *   --clean-up   remove obsolete keys no longer used in source
 */
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Source directories that may contain t('...') calls.
const SOURCE_DIRS = ["pages", "components"];

// Namespace this script manages — must match a useTranslation() namespace in
// next-i18next.config.js. "errors" is excluded; it's keyed by backend error codes.
const NAMESPACE = "common";

// Locales to sync, must match next-i18next.config.js i18n.locales.
const LOCALES = require("../next-i18next.config.js").i18n.locales;

// Define command line options.
const options = ["--clean-up"];

// Base URL for Google's Generative Language API
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const BATCH_SIZE = 50;

/**
 * Translates an array of texts to a target language using Google's Generative Language API
 * @param {Array<{key: string, text: string}>} texts - Array of objects containing text keys and values to translate
 * @param {string} targetLang - Target language code (e.g., 'ar', 'vi')
 * @returns {Promise<Object>} Object mapping keys to their translations
 */
async function translateBatch(texts, targetLang) {
  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_AI_API_KEY is not set in environment variables");
    }

    // Create a JSON structure for batch translation
    const textList = texts.map(({ text }) => text).join("\n---\n");

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Translate each of the following texts to "${targetLang}" language code. Return only the translations in the same order, separated by "---" on a new line. Do not include any explanations or additional content:\n\n${textList}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 8192,
          topP: 1,
          topK: 40,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Invalid response format from API");
    }

    // Split the response into individual translations
    const translations = data.candidates[0].content.parts[0].text
      .trim()
      .split("\n---\n")
      .map((text) =>
        text
          .trim()
          .replace(/^["']|["']$/g, "") // Remove quotes if present
          .replace(/^Translation:\s*/i, "") // Remove any "Translation:" prefix
          .trim(),
      );

    // Create a map of keys to translations
    const result = {};
    texts.forEach(({ key }, index) => {
      result[key] = translations[index] || texts[index].text; // Fallback to original text if translation is missing
    });

    return result;
  } catch (error) {
    console.error(`Batch translation failed for ${targetLang}:`, error.message);
    // Return original texts as fallback
    return texts.reduce((acc, { key, text }) => {
      acc[key] = text;
      return acc;
    }, {});
  }
}

/**
 * Translates text to a target language using Google's Generative Language API
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code (e.g., 'ar', 'vi')
 * @returns {Promise<string>} Translated text
 */
async function translateText(text, targetLang) {
  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_AI_API_KEY is not set in environment variables");
    }

    // Language display names for better context

    // const displayLanguage = languageNames[targetLang] || targetLang.toUpperCase()

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Translate the following text to "${targetLang}" language code. Return only the translated text, no explanations or additional content:\n\n"${text}"`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1, // Low temperature for consistent translations
          maxOutputTokens: 8192,
          topP: 1,
          topK: 40,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Invalid response format from API");
    }

    // Clean up the response to get just the translated text
    const translatedText = data.candidates[0].content.parts[0].text
      .trim()
      // Remove quotes if present
      .replace(/^["']|["']$/g, "")
      // Remove any "Translation:" prefix if present
      .replace(/^Translation:\s*/i, "")
      .trim();

    return translatedText;
  } catch (error) {
    console.error(
      `Translation failed for "${text}" to ${targetLang}:`,
      error.message,
    );
    return text; // Return original text if translation fails
  }
}

/**
 * Recursively reads all files from a directory.
 *
 * @param dir Path to the directory to recursively read all nested files.
 * @returns {Promise<string[]>} Flat array of absolute file paths.
 */
async function walk(dir) {
  const list = await fs.promises.readdir(dir);

  const nested = await Promise.all(
    list.map(async (name) => {
      const filePath = path.resolve(dir, name);
      const stat = await fs.promises.stat(filePath);

      return stat.isDirectory() ? walk(filePath) : [filePath];
    }),
  );

  return nested.flat();
}

/**
 * Finds every t('...') call in the given source files and maps each raw text
 * to the list of files it appears in.
 *
 * @param files Array of source file paths to scan.
 * @returns {Object<string, Object<string, string>>} text -> { filePath: fileContent }
 */
function extractTranslatableStrings(files) {
  console.log("Detect translatable text strings from source files...");

  const textStrings = {};

  for (const file of files) {
    if (!file.match(/\/(dist|node_modules)\//)) {
      const fileContent = fs.readFileSync(file).toString();
      const matches = fileContent.match(
        /\Wt\([\r\n]?\s*('[^']+'|"[^"]+")(,\s*[\r\n]?\{|\s*[\r\n]?\))/g,
      );

      if (matches) {
        matches.forEach((match) => {
          const test = match.match(
            /t\([\r\n]?\s*('[^']+'|"[^"]+")(,\s*[\r\n]?\{|\s*[\r\n]?\))/,
          );

          if (test) {
            const text = test[1].substring(1, test[1]?.length - 1);

            // Skip explicit "namespace:key" references (e.g. t("errors:CODE")) —
            // these already point at a key in another namespace, not raw text
            // to translate into this script's NAMESPACE.
            const isNamespacedKeyRef = /^[\w-]+:/.test(text);

            if (text && !isNamespacedKeyRef) {
              textStrings[text] = textStrings[text] || {};
              textStrings[text][file] = fileContent;
            }
          }
        });
      }
    }
  }

  return textStrings;
}

/**
 * Generates a slug key for every raw text string (e.g. "Save changes" -> "save-changes").
 *
 * @param textStrings Output of extractTranslatableStrings().
 * @returns {{ translationObject: Object<string, string>, allTextKeys: string[] }}
 *   translationObject maps key -> original raw text; allTextKeys is its key list.
 */
function buildTranslationKeys(textStrings) {
  const translationObject = {};

  for (const text in textStrings) {
    const textKey = text
      .toLowerCase()
      .replace(/\W+/g, "-")
      .replace(/^-(.+)$/g, "$1")
      .replace(/^(.+)-$/g, "$1");

    // Prefer keeping a human-readable raw text over an already-slugified one,
    // in case two different raw texts collide on the same generated key.
    if (
      !translationObject[textKey] ||
      translationObject[textKey].match(/^[a-z\-]+$/)
    ) {
      translationObject[textKey] = text;
    }
  }

  return { translationObject, allTextKeys: Object.keys(translationObject) };
}

/**
 * Replaces raw text inside t('...') calls with their generated keys and
 * writes the updated content back to each source file.
 *
 * @param textStrings Output of extractTranslatableStrings().
 * @param translationObject Output of buildTranslationKeys().
 */
function replaceTextWithKeysInSource(textStrings, translationObject) {
  const updatedFiles = {};

  for (const textKey in translationObject) {
    if (textKey !== translationObject[textKey]) {
      if (textStrings[translationObject[textKey]]) {
        for (const file in textStrings[translationObject[textKey]]) {
          const fileContent =
            updatedFiles[file] || textStrings[translationObject[textKey]][file];
          const escapedText = translationObject[textKey].replace(
            /(\^|\$|\*|\+|\?|\.|\(|\)|\||\[|\]|\{|\})/g,
            "\\$1",
          );

          const regExpPattern = new RegExp(
            `(t\\([\\r\\n]?\\s*['"])${escapedText}(['"](,\\s*[\\r\\n]?\\{|\\s*[\\r\\n]?\\)))`,
            "g",
          );

          updatedFiles[file] = fileContent.replace(
            regExpPattern,
            `$1${textKey}$2`,
          );
        }
      }
    }
  }

  for (const file in updatedFiles) {
    fs.writeFileSync(file, updatedFiles[file]);
    console.log(`Updated source file: ${file}`);
  }
}

/**
 * Reads public/locales/en/common.json, used as the fallback source text when a key
 * has no human-readable raw text recorded (i.e. source already uses keys).
 *
 * @returns {Object<string, string>}
 */
function readEnTranslation() {
  const enTranslationPath = path.resolve(
    `${__dirname}/../public/locales/en/${NAMESPACE}.json`,
  );

  try {
    return JSON.parse(fs.readFileSync(enTranslationPath).toString());
  } catch {
    return {};
  }
}

/**
 * Syncs a single locale JSON file: removes obsolete keys (--clean-up), then
 * translates and writes back any keys that are missing or stale.
 *
 * @param file Absolute path to the locale JSON file (e.g. public/locales/vi.json).
 * @param translationObject Output of buildTranslationKeys().
 * @param allTextKeys Output of buildTranslationKeys().
 * @param enTranslation Output of readEnTranslation().
 */
async function syncLocaleFile(
  file,
  translationObject,
  allTextKeys,
  enTranslation,
) {
  let updated, translation;
  const langCode = path.basename(path.dirname(file));

  try {
    translation = JSON.parse(fs.readFileSync(file).toString());
  } catch {
    translation = {};
  }

  // Remove obsolete text keys in translation files.
  if (cleanUp) {
    for (const textKey in translation) {
      if (!allTextKeys.includes(textKey)) {
        updated = true;
        delete translation[textKey];
      }
    }
  }

  // Collect texts that need translation
  const textsToTranslate = [];
  for (const textKey of allTextKeys) {
    if (
      force ||
      !translation[textKey] ||
      (textKey === translation[textKey] &&
        textKey !== translationObject[textKey])
    ) {
      // Get the English text to translate:
      // 1. If translationObject[textKey] differs from textKey, use it (human-readable text from source)
      // 2. Otherwise, look up from en.json (source already uses keys)
      const textToTranslate =
        translationObject[textKey] !== textKey
          ? translationObject[textKey]
          : enTranslation[textKey] || translationObject[textKey];

      if (textToTranslate) {
        textsToTranslate.push({
          key: textKey,
          text: textToTranslate,
        });
      } else {
        translation[textKey] = translationObject[textKey];
      }
    }
  }

  // Process translations in batches
  if (textsToTranslate.length > 0) {
    updated = true;
    console.log(
      `Translating ${textsToTranslate.length} keys to ${langCode}...`,
    );

    // Split into batches of BATCH_SIZE
    for (let i = 0; i < textsToTranslate.length; i += BATCH_SIZE) {
      const batch = textsToTranslate.slice(i, i + BATCH_SIZE);
      try {
        const batchTranslations = await translateBatch(batch, langCode);
        Object.assign(translation, batchTranslations);
        console.log(
          `Translated batch ${i / BATCH_SIZE + 1} of ${Math.ceil(textsToTranslate.length / BATCH_SIZE)} to ${langCode}`,
        );
      } catch (error) {
        console.error(`Failed to translate batch to ${langCode}:`, error);
        // Use original texts as fallback
        batch.forEach(({ key, text }) => {
          translation[key] = text;
        });
      }
    }
  }

  // Update translation files.
  if (updated) {
    fs.writeFileSync(file, JSON.stringify(translation, null, 2));
    console.log(`Updated translation file: ${file}`);
  }
}

/**
 * Orchestrates a full update pass: detect translatable strings in source,
 * replace them with generated keys, then sync every locale JSON file.
 *
 * @param files An array of source codes to process.
 */
async function update(files) {
  const textStrings = extractTranslatableStrings(files);
  const { translationObject, allTextKeys } = buildTranslationKeys(textStrings);
  const enTranslation = readEnTranslation();

  // Only the NAMESPACE file per locale (e.g. public/locales/en/common.json) —
  // other namespaces like "errors" are keyed by backend error code and are
  // maintained by hand, not by this script.
  const localeFiles = LOCALES.map((lang) =>
    path.resolve(`${__dirname}/../public/locales/${lang}/${NAMESPACE}.json`),
  );

  replaceTextWithKeysInSource(textStrings, translationObject);

  for (const file of localeFiles) {
    await syncLocaleFile(file, translationObject, allTextKeys, enTranslation);
  }

  console.log("Generating translations completed!");
}

// Check if source files are specified via command line.
// Read args from argv[2] onward, skip known flags (--clean-up), and keep
// only values that are paths to files that actually exist on disk.
const files = [];

for (let i = 2; i < process.argv?.length; i++) {
  if (!options.includes(process.argv[i]) && fs.existsSync(process.argv[i])) {
    files.push(process.argv[i]);
  }
}

// Prepare options.
const force = process.argv.includes("--force") && !files?.length;
const cleanUp = process.argv.includes("--clean-up") && !files?.length;

// Update source and translation files.
// Top-level await isn't available in CommonJS, so the entry point runs inside an async IIFE.
(async () => {
  if (files?.length) {
    await update(files);
  } else {
    const nested = await Promise.all(
      SOURCE_DIRS.map((dir) => walk(path.resolve(`${__dirname}/../${dir}`))),
    );
    await update(nested.flat());
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
