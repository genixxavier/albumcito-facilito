import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home", () => {
  it("muestra el título", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { name: "Albumcito Facilito" })).toBeInTheDocument();
  });
});
