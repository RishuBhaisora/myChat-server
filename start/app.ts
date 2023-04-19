import { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class AppProvider {
  constructor(protected app: ApplicationContract) {}

  public register() {}

  public boot() {
    // Register the DeleteAllUsers command
    this.app.container.use('Adonis/Core/Commands').add([require('../app/Commands/DeleteAllUsers').default])
  }

  public async shutdown() {}
}
