describe('Register Component', () => {
    test('displays error when email and password are empty', () => {
        render(
            <Router>
                <Register />
            </Router>
        );

        const signInButton = screen.getByText(/Sign in/i);
        fireEvent.click(signInButton);

        const errorMessage = screen.getByText(/Please fill in all fields!/i);
        expect(errorMessage).toBeInTheDocument();
    });
