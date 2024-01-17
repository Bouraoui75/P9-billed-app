import { fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store.js"
import router from "../app/Router.js"

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then mail icon in vertical layout should be highlighted", async () => {
      
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router();
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const windowIcon = screen.getByTestId('icon-mail')
      const iconActivated = windowIcon.classList.contains('active-icon')
      expect(iconActivated).toBeTruthy()
    })

    test("Then window icon in vertical layout should not be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router();
      window.onNavigate(ROUTES_PATH.NewBill)

      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      const iconActivated = windowIcon.classList.contains('active-icon')
      expect(iconActivated).toBeFalsy()
    })

    test("Then the new bill's form should be loaded with it's fields", () => {
      document.body.innerHTML = NewBillUI();
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
      expect(screen.getByTestId("expense-type")).toBeTruthy();
      expect(screen.getByTestId("expense-name")).toBeTruthy();
      expect(screen.getByTestId("datepicker")).toBeTruthy();
      expect(screen.getByTestId("amount")).toBeTruthy();
      expect(screen.getByTestId("vat")).toBeTruthy();
      expect(screen.getByTestId("pct")).toBeTruthy();
      expect(screen.getByTestId("commentary")).toBeTruthy();
      expect(screen.getByTestId("file")).toBeTruthy();
      expect(screen.getByRole("button")).toBeTruthy();
    })

    test('Then I can upload an image file', () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
  
      document.body.innerHTML = NewBillUI();
      /* mockStore.bills = jest.fn().mockImplementation(() => { return { create: () => { Promise.resolve({}) }}}) */
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
  
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      const inputFile = screen.getByTestId("file");
      const file = new File(["file"], "file.jpg", { type: "image/jpeg" })
      inputFile.addEventListener("change", handleChangeFile)
      fireEvent.change(inputFile, { target: { files: [file] } })
      expect(inputFile).toBeTruthy();
      expect(handleChangeFile).toHaveBeenCalled()
      expect(inputFile.files).toHaveLength(1)
      expect(inputFile.files[0].name).toBe("file.jpg")
    })
    
    test("Then I can't select upload a non image file", () => {
      document.body.innerHTML = NewBillUI()
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
  
      const newBill = new NewBill({
        document,
        onNavigate,
        localStorage: window.localStorage,
        store: null
      })
  
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      const inputFile = screen.getByTestId("file");
      expect(inputFile).toBeTruthy()


      inputFile.addEventListener("change", handleChangeFile)
      fireEvent.change(inputFile, { target: { files: [new File(["file.pdf"], "file.pdf", { type: "file/pdf" })] } })


      expect(handleChangeFile).toHaveBeenCalled();
      expect(inputFile.files[0].name).not.toBe("file.jpg")

      const errorMessage = screen.getByTestId("newbill-file-error-message")
      expect(errorMessage).toBeTruthy()
    })

    describe("Then I can submit the form completed", () => {
      test("Then the bill is created", () => {
        document.body.innerHTML = NewBillUI()
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
  
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: "a@a.com" }))
        const newBill = new NewBill({ document, onNavigate, store: null, localStorage: window.localStorage })
        
        const validBill = {
          type: "Restaurants et bars",
          name: "Vol Paris Montréal",
          date: "2022-02-15",
          amount: 200,
          vat: 70,
          pct: 30,
          commentary: "Commentary",
          fileUrl: "../img/0.jpg",
          fileName: "test.jpg",
          status: "pending"
        }

        const alternateValidBill = {
          type: "Restaurants et bars",
          name: "Vol Paris Montréal",
          date: "2022-02-15",
          amount: 200,
          vat: 70,
          pct: 30,
          commentary: "",
          fileUrl: "../img/0.jpg",
          fileName: "test.jpg",
          status: "pending"
        }

        screen.getByTestId("expense-type").value = validBill.type
        screen.getByTestId("expense-name").value = validBill.name
        screen.getByTestId("datepicker").value = validBill.date
        screen.getByTestId("amount").value = validBill.amount
        screen.getByTestId("vat").value = validBill.vat
        screen.getByTestId("pct").value = validBill.pct
        screen.getByTestId("commentary").value = validBill.commentary

        const inputType = screen.getByTestId("expense-type");
        fireEvent.change(inputType, {
          target: { value: validBill.type },
        });
        expect(inputType.value).toBe(validBill.type);

        const inputName = screen.getByTestId("expense-name");
        fireEvent.change(inputName, {
          target: { value: validBill.name },
        });
        expect(inputName.value).toBe(validBill.name);

        const inputDate = screen.getByTestId("datepicker");
        fireEvent.change(inputDate, {
          target: { value: validBill.date },
        });
        expect(inputDate.value).toBe(validBill.date);

        const inputAmount = screen.getByTestId("amount");
        fireEvent.change(inputAmount, {
          target: { value: validBill.amount },
        });
        expect(inputAmount.value).toBe(validBill.amount.toString());

        const inputVAT = screen.getByTestId("vat");
        fireEvent.change(inputVAT, {
          target: { value: validBill.vat },
        });
        expect(inputVAT.value).toBe(validBill.vat.toString());

        const inputPCT = screen.getByTestId("pct");
        fireEvent.change(inputPCT, {
          target: { value: validBill.pct },
        });
        expect(inputPCT.value).toBe(validBill.pct.toString());

        const inputCommentary = screen.getByTestId("commentary");
        fireEvent.change(inputCommentary, {
          target: { value: validBill.commentary },
        });
        expect(inputCommentary.value).toBe(validBill.commentary);

        const inputCommentaryEmpty = screen.getByTestId("commentary");
        fireEvent.change(inputCommentaryEmpty, {
          target: { value: alternateValidBill.commentary },
        });
        expect(inputCommentaryEmpty.value).toBe(alternateValidBill.commentary);

        newBill.fileName = validBill.fileName
        newBill.fileUrl = validBill.fileUrl
        newBill.updateBill = jest.fn()

        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
        const button = screen.getByTestId("form-new-bill")
        button.addEventListener("submit", handleSubmit)
        fireEvent.submit(button)
        
        expect(handleSubmit).toHaveBeenCalled()
        expect(newBill.updateBill).toHaveBeenCalled()
      })
    })
    
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(
            window,
            'localStorage',
            { value: localStorageMock }
        )
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Admin',
          email: "a@a"
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()
      })

      

      test('fetches error from an API and fails with 500 error', async () => {
        jest.spyOn(mockStore, 'bills')
        jest.spyOn(console, 'error').mockImplementation(() => { })
        Object.defineProperty(window, 'localStorage', {value: localStorageMock})
        Object.defineProperty(window, 'location', {value: {hash: ROUTES_PATH['NewBill']}})
        window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))
        document.body.innerHTML = `<div id="root"></div>`
        router()
        const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({pathname}) }
        mockStore.bills = jest.fn().mockImplementation(() => {
          return {
            update: () => Promise.reject(new Error('Erreur 500')),
            list: () => Promise.reject(new Error('Erreur 500'))
          }
        })
        const newBill = new NewBill({document, onNavigate, store: mockStore, localStorage: window.localStorage})

        // Submit form
        const form = screen.getByTestId('form-new-bill')
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
        form.addEventListener('submit', handleSubmit)
        fireEvent.submit(form)
        await new Promise(process.nextTick)
        expect(console.error).toBeCalled()
      })
    });
  })
})
