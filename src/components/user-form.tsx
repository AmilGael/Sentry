"use client";

import { useActionState } from "react";
import { createUser, updateUser, type UserFormState } from "@/lib/actions/users";
import { FormField } from "@/components/ui/form-field";

type UserData = {
  id: string;
  email: string;
  name: string;
  role: string;
};

const ROLES = [
  { value: "ADMIN", label: "Administrator" },
  { value: "CASE_MANAGER", label: "Case Manager" },
  { value: "EMPLOYMENT_SPECIALIST", label: "Employment Specialist" },
  { value: "FRONT_DESK", label: "Front Desk Officer" },
];

export function UserForm({ user }: { user?: UserData }) {
  const action = user ? updateUser : createUser;
  const [state, formAction, isPending] = useActionState<UserFormState, FormData>(
    action,
    { error: null, fieldErrors: {} }
  );

  return (
    <form action={formAction} className="space-y-6">
      {user && <input type="hidden" name="id" value={user.id} />}

      {state.error && (
        <div className="rounded-lg border border-red-800 bg-red-950/30 px-4 py-3">
          <p className="text-sm text-red-300">{state.error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FormField
          label="Full Name"
          name="name"
          required
          defaultValue={user?.name}
          error={state.fieldErrors.name}
          placeholder="e.g. Jane Smith"
        />
        <FormField
          label="Email"
          name="email"
          type="email"
          required
          defaultValue={user?.email}
          error={state.fieldErrors.email}
          placeholder="jane@reentry.local"
        />
        <FormField
          label="Role"
          name="role"
          as="select"
          required
          defaultValue={user?.role}
          error={state.fieldErrors.role}
          options={ROLES}
        />
        <FormField
          label={user ? "New Password (leave blank to keep)" : "Password"}
          name="password"
          type="password"
          required={!user}
          error={state.fieldErrors.password}
          placeholder={user ? "••••••••" : "Min 8 characters"}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black hover:bg-gray-200 transition-colors disabled:opacity-50"
      >
        {isPending ? "Saving…" : user ? "Update User" : "Create User"}
      </button>
    </form>
  );
}
