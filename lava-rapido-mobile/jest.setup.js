globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Expo installs fetch lazily. Resolve it before Jest tears down the test environment.
void globalThis.fetch;
