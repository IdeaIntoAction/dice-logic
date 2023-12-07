export default {
    "env": {
        "browser": true,
        "es2021": true,
        "node": true
    },
    "extends": "standard-with-typescript",
    "overrides": [
        {
            "env": {
                "node": true
            },
            "files": [
                ".eslintrc.{ts, js}"
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    "parserOptions": {
      "ecmaVersion": "latest",
      "sourceType": "module"
    },
    "ignorePatterns": ["commitlint.config.ts"],
    "rules": {
      "indent": ["error", 2],
      "linebreak-style": ["error", "unix"],
      "quotes": ["error", "single"],
      "semi": ["error", "always"],
      "no-unused-vars": "warn",
      "no-console": "off",
      "eqeqeq": "error"
    }
}
