import { Button } from "@/components/ui/button"

export function LogoutButton() {
  return (
    <form action="/api/auth/signout" method="POST">
      <Button 
        type="submit" 
        variant="secondary"
        size="sm"
      >
        Sign out
      </Button>
    </form>
  )
}