import { createRoot } from "react-dom/client";
import { Studio } from "sanity";
import config from "./sanity.config";

const root = createRoot(document.getElementById("root")!);
root.render(<Studio config={config} />);
