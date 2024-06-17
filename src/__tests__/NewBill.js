/**
 * @jest-environment jsdom
 */
import { fireEvent, screen, waitFor } from "@testing-library/dom"
import { ROUTES} from "../constants/routes"
import NewBillUI from "../views/NewBillUI.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import NewBill from "../containers/NewBill.js"
import mockStore from "../__mocks__/store"


jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  
  describe("When I am on NewBill Page", () => {
    
    test("Then the page is charged", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      await waitFor(() => screen.getByText("Envoyer une note de frais"))
      expect(screen.getByTestId('form-new-bill')).toBeTruthy
    })

    test("Then i upload a file in a good format", async () => {
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => { });
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const newBill = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      })
      document.body.innerHTML = NewBillUI()
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
      await waitFor(() => screen.getByText("Envoyer une note de frais"))
      const changeFileInput = screen.getByTestId('file')
      expect(changeFileInput).toBeTruthy()
      const file = new File(['hello'], 'hello.png', { type: 'image/png' });
      changeFileInput.addEventListener('change',handleChangeFile)
      fireEvent.change(changeFileInput, { target: { files: [file] } });
      //await userEvent.upload(changeFileInput, file)
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(changeFileInput.files[0]).toBe(file)
      expect(handleChangeFile).toHaveBeenCalledTimes(1);
      expect(alertMock).not.toHaveBeenCalled();
    })

    test("Then i upload a file in a wrong format", async () => {
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => { });
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const newBill = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      })
      document.body.innerHTML = NewBillUI()
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
      await waitFor(() => screen.getByText("Envoyer une note de frais"))
      const changeFileInput = screen.getByTestId('file')
      expect(changeFileInput).toBeTruthy()
      const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
      changeFileInput.addEventListener('change',handleChangeFile)
      fireEvent.change(changeFileInput, { target: { files: [file] } });
      //userEvent.upload(changeFileInput, file)
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(changeFileInput.files[0]).toBe(file)
      expect(handleChangeFile).toHaveBeenCalledTimes(1);
      expect(alertMock).toHaveBeenCalledTimes(1);
    })

    test("Then i submit a bill", async () => {
    window.localStorage.clear
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee',
      email: "e@e"
    }))
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => { });
      const consoleSpy = jest.spyOn(console, 'log');
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const newBill = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      })
      document.body.innerHTML = NewBillUI()
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
      await waitFor(() => screen.getByText("Envoyer une note de frais"))
      expect(screen.getByTestId('expense-type').value).toBe('Transports')
      const nameInput = screen.getByTestId('expense-name')
      fireEvent.change(nameInput, { target: { value: 'volTuCoco' } })
      const dateInput = screen.getByTestId('datepicker')
      fireEvent.change(dateInput, { target: { value: '2021-11-23' } })
      const amountInput = screen.getByTestId('amount')
      fireEvent.change(amountInput, { target: { value: '348' } })
      const vatInput = screen.getByTestId('vat')
      fireEvent.change(vatInput, { target: { value: '70' } })
      const pctInput = screen.getByTestId('pct')
      fireEvent.change(pctInput, { target: { value: '20' } })
      const commentaryInput = screen.getByTestId('commentary')
      fireEvent.change(commentaryInput, { target: { value: 'Un vol plutot sympatique !' } })
      const fileInput = screen.getByTestId('file');
      const file = new File(['hello'], 'hello.png', { type: 'image/png' });
      fileInput.addEventListener('change',handleChangeFile)
      fireEvent.change(fileInput, { target: { files: [file] } });
      const formSubmit = screen.getByTestId("form-new-bill")
      expect(formSubmit).toBeTruthy()
      formSubmit.addEventListener('submit', handleSubmit)
      fireEvent.submit(formSubmit)
      expect(handleSubmit).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
      await new Promise(resolve => setTimeout(resolve, 100));
      await waitFor(() => screen.getByText("Mes notes de frais"))
      expect(screen.getByText("Mes notes de frais")).toBeTruthy()
      const tbody = screen.getByTestId('tbody')
      expect(tbody).toBeTruthy()
    })
  })
})


