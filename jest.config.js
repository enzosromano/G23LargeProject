module.exports = async () => {
    return {
        setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],
        verbose: true,
        "preset": "@shelf/jest-mongodb"
    };
};