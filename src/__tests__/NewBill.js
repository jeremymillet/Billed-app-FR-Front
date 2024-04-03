/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { screen, fireEvent } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import NewBill from "../containers/NewBill.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import store from "../__mocks__/store.js";
import mockStore from "../__mocks__/store";

import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

beforeAll(() => {
  Object.defineProperty(window, "localStorage", { value: localStorageMock });
  window.localStorage.setItem(
    "user",
    JSON.stringify({
      type: "Employee",
      email: "employee@test.tld",
      status: "connected",
    })
  );
  const root = document.createElement("div");
  root.setAttribute("id", "root");
  document.body.append(root);
  router();
  window.onNavigate(ROUTES_PATH.NewBill);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("Given I am connected as an employee", () => {
  describe("When I am on New Bill Page", () => {
    test("Then title should appear", () => {
      expect(screen.findByText("Envoyer une note de frais")).toBeTruthy();
    });

    test("Then mail icon in vertical layout should be highlighted", () => {
      const windowIcon = screen.getByTestId("icon-mail");
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });

    test("Then all the inputs are displayed", () => {
      const form = document.querySelector("form");
      expect(form.length).toEqual(9);
    });

    test("Then the submit button is displayed", () => {
      expect(screen.findByText("Envoyer")).toBeTruthy();
    });
  });
});

describe("Given I am connected as an employee", () => {
  describe("When I am on newBill Page and I fill out the form", () => {
    test("Then I choose an option in the select menu and it should select 'Hôtel et logement' from select menu", async () => {
      const inputSelect = screen.getByTestId("expense-type");
      userEvent.selectOptions(inputSelect, ["Hôtel et logement"]);
      await expect(inputSelect.value).toBe("Hôtel et logement");
    });

    test("Then I enter an expense name and it should display 'Nouvelle facture' in the name input", async () => {
      const inputName = screen.getByTestId("expense-name");
      userEvent.type(inputName, "Nouvelle facture");
      console.log(inputName.value);
      await expect(inputName.value).toBe("Nouvelle facture");
    });

    test("Then I select a date and it should display the date in the date input", async () => {
      const inputDate = screen.getByTestId("datepicker");
      userEvent.type(inputDate, "2023-03-22");
      await expect(inputDate.value).toBe("2023-03-22");
    });

    test("Then I enter an amount and it should display '150' in the amount input", async () => {
      const inputAmount = screen.getByTestId("amount");
      userEvent.type(inputAmount, "150");
      await expect(inputAmount.value).toBe("150");
    });

    test("Then I enter a VAT amount and it should display '30' in the VAT amount input", async () => {
      const inputVATAmount = screen.getByTestId("vat");
      userEvent.type(inputVATAmount, "30");
      await expect(inputVATAmount.value).toBe("30");
    });

    test("Then I enter a VAT Pourcentage and it should display '20' in the VAT Pourcentage input", async () => {
      const inputVATPourcentage = screen.getByTestId("pct");
      userEvent.type(inputVATPourcentage, "20");
      await expect(inputVATPourcentage.value).toBe("20");
    });

    test("Then I write a commentary and it should display 'Je t'envoie les notes de frais pour le restaurant à part' in the commentary input", async () => {
      const inputCommentary = screen.getByTestId("commentary");
      userEvent.type(
        inputCommentary,
        "Je t'envoie les notes de frais pour le restaurant à part"
      );
      await expect(inputCommentary.value).toBe(
        "Je t'envoie les notes de frais pour le restaurant à part"
      );
    });
  });

  describe("When I am on newBill Page and I upload a file with an incorrect extension ", () => {
    test("Then it should display the error message", async () => {
      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });
      const handleChangeFile = jest.fn(() => newBill.handleChangeFile);
      const inputFile = screen.getByTestId("file");
      inputFile.addEventListener("change", handleChangeFile);
      fireEvent.change(inputFile, {
        target: {
          files: [
            new File(["fileTestPdf"], "test.pdf", { type: "application/pdf" }),
          ],
        },
      });
      await expect(handleChangeFile).toHaveBeenCalledTimes(1);
      await expect(inputFile.validationMessage).toBe(
        "Formats acceptés : jpg, jpeg et png"
      );
    });
  });

  describe("When I am on newBill Page and I upload a file with a correct extension ", () => {
    test("Then I upload a file with a correct extension and it should not display the error message", async () => {
      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });
      const handleChangeFile = jest.fn(() => newBill.handleChangeFile);
      const inputFile = screen.getByTestId("file");
      inputFile.addEventListener("change", handleChangeFile);
      fireEvent.change(inputFile, {
        target: {
          files: [new File(["fileTestPng"], "test.png", { type: "image/png" })],
        },
      });
      await expect(handleChangeFile).toHaveBeenCalledTimes(1);
      await expect(inputFile.validationMessage).not.toBe(
        "Formats acceptés : jpg, jpeg et png"
      );
    });
  });

  describe("When I am on newBill Page and I submit a valid bill", () => {
    test("Then it should render the Bill Page", async () => {
      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });

      const validBill = {
        name: "Nouvelle facture",
        date: "2023-03-22",
        type: "Hôtel et logement",
        amount: 150,
        pct: 20,
        vat: "30",
        fileName: "test.png",
        fileUrl: "https://test.png",
      };

      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));

      document.querySelector('input[data-testid="expense-name"]').value =
        validBill.name;
      document.querySelector('input[data-testid="datepicker"]').value =
        validBill.date;
      document.querySelector('select[data-testid="expense-type"]').value =
        validBill.type;
      document.querySelector('input[data-testid="amount"]').value =
        validBill.amount;
      document.querySelector('input[data-testid="vat"]').value = validBill.vat;
      document.querySelector('input[data-testid="pct"]').value = validBill.pct;
      document.querySelector('textarea[data-testid="commentary"]').value =
        validBill.commentary;
      newBill.fileUrl = validBill.fileUrl;
      newBill.fileName = validBill.fileName;

      const submit = screen.getByTestId("form-new-bill");
      submit.addEventListener("click", handleSubmit);
      userEvent.click(submit);
      expect(handleSubmit).toHaveBeenCalledTimes(1);

      await expect(screen.findByText("Mes notes de frais")).toBeTruthy();
      const windowIcon = screen.getByTestId("icon-window");
      await expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });
  });
});

// test d'intégration POST
describe("Given I am a user connected as an employee", () => {
  describe("When I am on newBill Page and I have sent the form", () => {
    test("Then it should create a new bill to mock API POST", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "employee@test.tld",
          status: "connected",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);

      const dataCreated = jest.spyOn(mockStore.bills(), "create");
      const bill = {
        name: "Nouvelle facture",
        date: "2023-03-22",
        type: "Hôtel et logement",
        amount: 150,
        pct: 20,
        vat: "30",
        fileName: "test.jpg",
        fileUrl: "https://test.jpg",
        commentary: "Test bill for spying create function",
      };
      const result = await mockStore.bills().create(bill);

      expect(dataCreated).toHaveBeenCalled();
      expect(result).toEqual({
        fileUrl: "https://localhost:3456/images/test.jpg",
        key: "1234",
      });
    });
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "employee@test.tld",
            status: "connected",
          })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      });
      afterEach(() => {
        jest.clearAllMocks();
      });
      test("Then sends new bill to the API and fails with 404 message error", async () => {
        const error = new Error("Erreur 404");
        mockStore.bills.mockImplementationOnce(() => {
          return {
            create: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.NewBill);
        await new Promise(process.nextTick);
        await expect(mockStore.bills().create({})).rejects.toEqual(error);
      });

      test("Then sends new bill to the API and fails with 500 message error", async () => {
        const error = new Error("Erreur 500");
        mockStore.bills.mockImplementationOnce(() => {
          return {
            create: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.NewBill);
        await new Promise(process.nextTick);
        await expect(mockStore.bills().create({})).rejects.toEqual(error);
      });
    });
  });
});
