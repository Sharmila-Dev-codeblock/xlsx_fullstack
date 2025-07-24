import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FileUploader from '../component/fileUploader';
import axios from '../axios/axiosInstance';
import MockAdapter from 'axios-mock-adapter';
import userEvent from '@testing-library/user-event';

const mockAxios = new MockAdapter(axios);

jest.mock('../Users', () => () => <div data-testid="mock-users">Users List</div>);

describe('FileUploader Component', () => {
  beforeEach(() => {
    mockAxios.reset();
    mockAxios.onGet('/user/all').reply(200, []);
  });

  it('renders input and upload button', () => {
    render(<FileUploader />);
    expect(screen.getByText(/Upload Excel File/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument();
  });

  it('simulates file upload success', async () => {
    mockAxios.onPost('/user/upload').reply(200, { message: 'File uploaded successfully.' });

    render(<FileUploader />);
    const file = new File(['dummy'], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const wrapper = screen.getByLabelText(/Upload Excel File/i);
    const input = wrapper.querySelector('input') as HTMLInputElement;
    await userEvent.upload(input, file);

    const button = screen.getByRole('button', { name: /upload/i });
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('File uploaded successfully.');
    });
  });

  it('handles upload failure with single error message', async () => {
    mockAxios.onPost('/user/upload').reply(400, { message: 'Upload failed.' });

    render(<FileUploader />);
    const file = new File(['dummy'], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const wrapper = screen.getByLabelText(/Upload Excel File/i);
    const input = wrapper.querySelector('input') as HTMLInputElement;
    await userEvent.upload(input, file);

    const button = screen.getByRole('button', { name: /upload/i });
    await userEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Upload failed.');
    });
  });

  it('handles upload failure with multiple errors', async () => {
    mockAxios.onPost('/user/upload').reply(400, {
      message: ['Header error', 'Empty cell found'],
    });

    render(<FileUploader />);
    const file = new File(['dummy'], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const wrapper = screen.getByLabelText(/Upload Excel File/i);
    const input = wrapper.querySelector('input') as HTMLInputElement;
    await userEvent.upload(input, file);

    const button = screen.getByRole('button', { name: /upload/i });
    await userEvent.click(button);

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Header error');
      expect(alert).toHaveTextContent('Empty cell found');
    });
  });
});
