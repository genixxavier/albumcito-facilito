import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ShareButton } from "./share-button";

// jsdom no implementa <dialog>.showModal/close.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
});

afterEach(() => {
  cleanup();
  Reflect.deleteProperty(navigator, "share");
  vi.restoreAllMocks();
});

function setup() {
  render(<ShareButton title="Cody en el espacio" path="/albums/cody-espacio" />);
  return userEvent.setup();
}

describe("ShareButton", () => {
  it("abre el modal con las opciones y enlaces a las redes", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Compartir" }));

    expect(screen.getByRole("dialog", { name: "Compartir Cody en el espacio" })).toBeInTheDocument();
    for (const name of ["Facebook", "X (Twitter)", "WhatsApp", "Telegram", "Correo"]) {
      expect(screen.getByRole("link", { name })).toHaveAttribute("rel", "noopener noreferrer");
    }
    expect(screen.getByRole("link", { name: "WhatsApp" })).toHaveAttribute(
      "href",
      expect.stringContaining(encodeURIComponent("/albums/cody-espacio")),
    );
    expect(screen.getByRole("button", { name: "Copiar enlace" })).toBeInTheDocument();
  });

  it("se cierra con el botón Cerrar", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Compartir" }));
    await user.click(screen.getByRole("button", { name: "Cerrar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("copia el enlace y confirma", async () => {
    const user = setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    await user.click(screen.getByRole("button", { name: "Compartir" }));
    await user.click(screen.getByRole("button", { name: "Copiar enlace" }));

    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/albums/cody-espacio`);
    expect(await screen.findByText("Enlace copiado")).toBeInTheDocument();
  });

  it("muestra la URL en un campo si el portapapeles falla", async () => {
    const user = setup();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("denied"));
    await user.click(screen.getByRole("button", { name: "Compartir" }));
    await user.click(screen.getByRole("button", { name: "Copiar enlace" }));

    expect(await screen.findByRole("textbox", { name: "Enlace para compartir" })).toHaveValue(
      `${window.location.origin}/albums/cody-espacio`,
    );
    expect(screen.queryByText("Enlace copiado")).not.toBeInTheDocument();
  });

  it("no ofrece compartir nativo sin Web Share API", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Compartir" }));
    expect(screen.queryByRole("button", { name: "Compartir con…" })).not.toBeInTheDocument();
  });

  it("ofrece compartir nativo con Web Share API e ignora la cancelación", async () => {
    const share = vi.fn().mockRejectedValue(new DOMException("cancelado", "AbortError"));
    Object.defineProperty(navigator, "share", { value: share, configurable: true });
    const user = setup();
    await user.click(screen.getByRole("button", { name: "Compartir" }));
    await user.click(screen.getByRole("button", { name: "Compartir con…" }));

    expect(share).toHaveBeenCalledWith(
      expect.objectContaining({ url: `${window.location.origin}/albums/cody-espacio` }),
    );
  });
});
