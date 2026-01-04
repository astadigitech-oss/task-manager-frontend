export default function Header() {
    return (
        <footer className="bg-card text-center py-3 border-t border-border text-sm text-muted-foreground">
            © {new Date().getFullYear()} Task Manager. All rights reserved.
        </footer>
    )
}
