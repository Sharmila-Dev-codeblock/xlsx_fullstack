import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FileUploader from '../component/fileUploader';
import axios from '../axios/axiosInstance';
import MockAdapter from 'axios-mock-adapter';

// Setup mock
const mockAxios = new MockAdapter(axios);

jest.mock('../Users', () => () => <div data-testid="mock-users">Users List</div>);

describe('FileUploader Component', () => {
  beforeEach(() => {
    mockAxios.reset();
  });

  it('renders input and upload button', () => {
    render(<FileUploader />);
    expect(screen.getByText(/Upload Excel File/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument();
  });

  it('shows error if no file is selected', async () => {
    render(<FileUploader />);
    const button = screen.getByRole('button', { name: /upload/i });
    fireEvent.click(button);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Please select a file');
  });

  it('simulates file upload success', async () => {
    mockAxios.onPost('/user/upload').reply(200, { message: 'File uploaded successfully.' });
    mockAxios.onGet('/user/all').reply(200, []);

    render(<FileUploader />);

    const file = new File(['dummy'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const input = screen.getByLabelText(/Upload Excel File/i);

    fireEvent.change(input, { target: { files: [file] } });

    const button = screen.getByRole('button', { name: /upload/i });
    fireEvent.click(button);

    const successAlert = await screen.findByRole('alert');
    expect(successAlert).toHaveTextContent('File uploaded successfully.');
  });

  it('handles upload failure with single error message', async () => {
    mockAxios.onPost('/user/upload').reply(400, { message: 'Upload failed.' });

    render(<FileUploader />);

    const file = new File(['dummy'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    fireEvent.change(screen.getByLabelText(/Upload Excel File/i), {
      target: { files: [file] },
    });

    fireEvent.click(screen.getByRole('button', { name: /upload/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Upload failed.');
  });

  it('handles upload failure with multiple errors', async () => {
    mockAxios.onPost('/user/upload').reply(400, { message: ['Header error', 'Empty cell found'] });

    render(<FileUploader />);

    const file = new File(['dummy'], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    fireEvent.change(screen.getByLabelText(/Upload Excel File/i), {
      target: { files: [file] },
    });

    fireEvent.click(screen.getByRole('button', { name: /upload/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Header error');
    expect(alert).toHaveTextContent('Empty cell found');
  });
});
