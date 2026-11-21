// Quick verification that demo users get different eligible lists
import { store } from "../lib/store";
import { evaluate } from "../lib/eligibility";

const users = store.users.read();
const schemes = store.schemes.read();

for (const user of users) {
  const eligible = schemes
    .filter(s => s.role === user.role)
    .filter(s => evaluate(user, s).status === "eligible")
    .map(s => s.name);
  console.log(`\n${user.email} (${user.role}): ${eligible.length} eligible`);
  eligible.forEach(name => console.log(`  - ${name}`));
}