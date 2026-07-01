import { Avatar, Dropdown } from "antd";
import { useUser } from "../../stores/auth";

const AccountDropdown = () => {
  const user = useUser();
  console.log("user ===== ", user);
  return (
    <Dropdown>
      <Avatar shape="circle" src={user?.picture}>
        {user?.name.charAt(0).toUpperCase()}
      </Avatar>
    </Dropdown>
  );
};

export default AccountDropdown;
