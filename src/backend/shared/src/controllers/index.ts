import { Express } from "express";
import { BaseController, DependencyInjectedClasses } from "./BaseController";
import { getDIClasses } from "./getDIClasses";

const setupControllers = (app: Express, controllers: BaseController[], diClasses: DependencyInjectedClasses) =>
	controllers.forEach((controller) => controller.init(app, diClasses));

export { setupControllers, BaseController, DependencyInjectedClasses, getDIClasses };
