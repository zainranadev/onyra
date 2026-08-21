import { Link } from "react-router-dom";
import { Button } from "@/components/common/Button";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center text-center">
      <span className="font-display text-7xl text-brown sm:text-8xl">404</span>
      <h1 className="mt-4 font-display text-2xl text-ink">Looks like this page went off the shelf.</h1>
      <p className="mt-2 max-w-sm text-graphite">The page you're looking for may have moved or no longer exists.</p>
      <div className="mt-7 flex gap-3">
        <Link to="/"><Button>Return home</Button></Link>
        <Link to="/shop"><Button variant="outline">Continue shopping</Button></Link>
      </div>
    </div>
  );
}
