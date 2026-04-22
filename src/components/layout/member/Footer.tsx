export default function Footer() {
    return (
        <footer className="bg-background dark:bg-card text-center py-3 border-t border-border text-sm text-muted-foreground rounded-xl mx-4 mb-4">
            © {new Date().getFullYear()} ASTA DIGITAL . All rights reserved.
        </footer>
    )
}
