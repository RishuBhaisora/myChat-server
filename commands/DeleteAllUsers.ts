import { BaseCommand } from '@adonisjs/core/build/standalone'
import User from 'App/Models/User'

export default class DeleteAllUsers extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'delete:all_users'

  /**
   * Command description is displayed in the "help" output
   */
  public static description = 'Delete all users from the database'

  public static settings = {
    /**
     * Set the following value to true, if you want to load the application
     * before running the command. Don't forget to call `node ace generate:manifest` 
     * afterwards.
     */
    loadApp: true,

    /**
     * Set the following value to true, if you want this command to keep running until
     * you manually decide to exit the process. Don't forget to call 
     * `node ace generate:manifest` afterwards.
     */
    stayAlive: false,
  }

  public async run() {
    await User.query().delete()
    this.logger.info('All users have been deleted from the database.')
  }
}


