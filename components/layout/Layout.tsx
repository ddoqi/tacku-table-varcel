import Footer from "./Footer";
import Header from "./Header";

export default function Layout({ children }: { children: any }) {
    return (
        <div>
            <Header />
            <div className="pt-[83px] min-h-screen">{children}</div>
            <Footer />
        </div>
    );
}
