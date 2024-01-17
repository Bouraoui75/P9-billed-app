/**
 * @jest-environment jsdom
 */

import {screen, waitFor, fireEvent} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      
      expect(windowIcon.classList.contains('active-icon')).toBeTruthy();

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const sortedByDescending = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(sortedByDescending)
      expect(dates).toEqual(datesSorted)
    })

    describe('When I click on "Nouvelle note de frais" button', () => {
      test("Then it should render NewBill Page", () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.append(root);
        router();
        window.onNavigate(ROUTES_PATH.NewBill);
        const newBills = new Bills({
          document,
          onNavigate,
          localStorage: window.localStorage,
          store: null
        })
        const newBillBtn = screen.getByTestId('btn-new-bill')
        const handleClickNewBill = jest.fn(newBills.handleClickNewBill)
        newBillBtn.addEventListener('click',handleClickNewBill)
        fireEvent.click(newBillBtn);

        expect(handleClickNewBill).toHaveBeenCalled();
        expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
      }) 
    })

    describe("When I click on first eye icon", () => {
      test("Then modal should open and display the image related to the bill", () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.append(root);
        router();
        window.onNavigate(ROUTES_PATH.NewBill);
        const newBills = new Bills({
          document,
          onNavigate,
          localStorage: window.localStorage,
          store: null
        })
        $.fn.modal = jest.fn();
        const handleClickIconEye = jest.fn(() => { newBills.handleClickIconEye });
        const firstEyeIconElement = screen.getAllByTestId("icon-eye")[0];
        firstEyeIconElement.addEventListener("click", handleClickIconEye);
        fireEvent.click(firstEyeIconElement);

        expect(handleClickIconEye).toHaveBeenCalled();
        expect($.fn.modal).toHaveBeenCalled();
      })
    })
    
    describe("When I am on the modal", () => {
      test("Then I should be able to close the modal", () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.append(root);
        router();
        window.onNavigate(ROUTES_PATH.NewBill);
        const newBills = new Bills({
          document,
          onNavigate,
          localStorage: window.localStorage,
          store: null
        })
        $.fn.modal = jest.fn();
        const handleClickIconEye = jest.fn(() => { newBills.handleClickIconEye });
        const firstEyeIconElement = screen.getAllByTestId("icon-eye")[0];
        firstEyeIconElement.addEventListener("click", handleClickIconEye);
        fireEvent.click(firstEyeIconElement);

        expect(handleClickIconEye).toHaveBeenCalled();
        expect($.fn.modal).toHaveBeenCalled();

        const closeModal = jest.fn(() => { newBills.closeModal });
        const closeModalElement = screen.getByTestId("close-bill-modal");

        closeModalElement.addEventListener("click", closeModal);
        fireEvent.click(closeModalElement);

        expect(closeModal).toHaveBeenCalled();
      })
    });
  })
})

// Integration Tests
describe("Given I am connected as an employee", () => {
  describe('When I am on Bills Page', () => {
    test("fetches bills from mock API GET", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'a@a'
      }))
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      expect(await waitFor(() => screen.getByText('Mes notes de frais'))).toBeTruthy();
      expect(await waitFor(() => screen.getByTestId('btn-new-bill'))).toBeTruthy();
    })
  })

  describe("When an error occurs on the API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
        window,
        'localStorage',
        { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'a@a'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })

    test("fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }
      })
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await waitFor(() => screen.getByText(/Erreur 404/))
      expect(message).toBeTruthy()
    })

    test("fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }
      })
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await waitFor(() => screen.getByText(/Erreur 500/))
      expect(message).toBeTruthy()
    })
  })
});
