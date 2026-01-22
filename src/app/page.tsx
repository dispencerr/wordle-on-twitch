import { Suspense } from "react";
import HomeClient from "./HomeClient";

export default function Page() {
  return (
    <Suspense fallback={<span>Loading...</span>}>
      <HomeClient />
    </Suspense>
  );
}
