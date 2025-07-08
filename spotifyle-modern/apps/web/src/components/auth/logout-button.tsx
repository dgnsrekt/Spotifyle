export function LogoutButton() {
  return (
    <form action="/api/auth/signout" method="POST">
      <button
        type="submit"
        className="rounded-md bg-gray-700 px-3 py-2 text-sm font-medium text-gray-200 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
      >
        Sign out
      </button>
    </form>
  )
}