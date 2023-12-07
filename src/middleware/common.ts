import express, { Router } from 'express';

const commonMiddleware = Router();

commonMiddleware.use(express.json());
commonMiddleware.use(express.urlencoded({ extended: true }));

export { commonMiddleware };