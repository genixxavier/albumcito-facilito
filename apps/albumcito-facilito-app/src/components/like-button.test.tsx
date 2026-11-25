import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LikeButton } from "./like-button";

vi.mock("@/app/actions", () => ({ toggleLikeAction: vi.fn(() => new Promise<void>(() => {})) }));

afterEach(cleanup);

describe("LikeButton", () => {
  it("muestra el estado sin like con aria correcto y sin animación inicial", () => {
    render(<LikeButton albumId="a1" likeCount={2} liked={false} />);
    const button = screen.getByRole("button", { name: "Me gusta" });
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(button).toHaveTextContent("2");
    expect(button.querySelector(".motion-safe\\:animate-like-pop")).toBeNull();
  });

  it("al dar like actualiza aria, contador y dispara el pop", async () => {
    render(<LikeButton albumId="a1" likeCount={2} liked={false} />);
    fireEvent.click(screen.getByRole("button", { name: "Me gusta" }));

    const button = await screen.findByRole("button", { name: "Quitar me gusta" });
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveTextContent("3");
    expect(button.querySelector(".motion-safe\\:animate-like-pop")).not.toBeNull();
  });

  it("con like previo no anima al cargar y al quitar baja el contador", async () => {
    render(<LikeButton albumId="a1" likeCount={5} liked />);
    const button = screen.getByRole("button", { name: "Quitar me gusta" });
    expect(button.querySelector(".motion-safe\\:animate-like-pop")).toBeNull();

    fireEvent.click(button);
    const after = await screen.findByRole("button", { name: "Me gusta" });
    expect(after).toHaveTextContent("4");
  });
});
