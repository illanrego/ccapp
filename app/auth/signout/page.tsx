"use client";
import { signOut } from "./actions";

export default function Page() {
	return (
		<form action={async () => {
			await signOut();
		}}>
			<button>Sign out</button>
		</form>
	);
}
