import { Express } from "express";
import { BaseController, DependencyInjectedClasses } from "./BaseController";
import { getDIClasses } from "./getDIClasses";
import { setupGracefulShutdown } from "./setupGracefulShutdown";

const setupControllers = (app: Express, controllers: BaseController[], diClasses: DependencyInjectedClasses) =>
	controllers.forEach((controller) => controller.init(app, diClasses));

export { setupControllers, setupGracefulShutdown, BaseController, DependencyInjectedClasses, getDIClasses };
