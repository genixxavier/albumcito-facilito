import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { StickerGrid } from "./sticker-grid";

const stickers = [
  { id: "s1", number: 1, name: "Cody astronauta" },
  { id: "s2", number: 3, name: "Cody pirata" },
];

afterEach(cleanup);

describe("StickerGrid", () => {
  it("abre un diálogo modal con la estampa ampliada al hacer clic", () => {
    render(<StickerGrid stickers={stickers} />);
    fireEvent.click(screen.getByRole("button", { name: "Ver Cody pirata en grande" }));

    const dialog = screen.getByRole("dialog", { name: "Estampa Cody pirata" });
    expect(dialog).toHaveTextContent("#3");
    expect(dialog).toHaveTextContent("Cody pirata");
  });

  it("se cierra con el botón Cerrar y devuelve el foco a la estampa", () => {
    render(<StickerGrid stickers={stickers} />);
    const tile = screen.getByRole("button", { name: "Ver Cody astronauta en grande" });
    fireEvent.click(tile);
    fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));
    const dialog = document.querySelector("dialog")!;
    // Sin movimiento reducido el cierre espera a la animación de salida.
    expect(dialog).toHaveAttribute("data-closing");
    fireEvent.animationEnd(dialog);

    expect(dialog).not.toHaveAttribute("open");
    expect(tile).toHaveFocus();
  });

  it("se cierra con Escape (evento cancel)", () => {
    render(<StickerGrid stickers={stickers} />);
    fireEvent.click(screen.getByRole("button", { name: "Ver Cody astronauta en grande" }));
    const dialog = document.querySelector("dialog")!;
    fireEvent(dialog, new Event("cancel", { cancelable: true }));
    fireEvent.animationEnd(dialog);

    expect(dialog).not.toHaveAttribute("open");
  });

  it("se cierra al hacer clic en el fondo, no dentro del contenido", () => {
    render(<StickerGrid stickers={stickers} />);
    fireEvent.click(screen.getByRole("button", { name: "Ver Cody astronauta en grande" }));
    const dialog = document.querySelector("dialog")!;

    fireEvent.click(screen.getByText("Cody astronauta", { selector: "span.text-2xl" }));
    expect(dialog).not.toHaveAttribute("data-closing");

    fireEvent.click(dialog);
    expect(dialog).toHaveAttribute("data-closing");
  });
});
