import { userService } from "./lib/services/user-service";
async function run() {
  const users = await userService.getUsers({ role: "user" });
  console.log(JSON.stringify(users, null, 2));
}
run();
