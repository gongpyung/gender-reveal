import { render, screen } from "@testing-library/react";
import CreatorPage from "@/app/gender-reveal/page";

it("renders the reference creator heading", () => {
  render(<CreatorPage />);
  expect(screen.getByText("Gender-Reveal")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Come on baby" })).toBeInTheDocument();
});
