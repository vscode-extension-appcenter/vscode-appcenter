import * as vscode from 'vscode';
import { AppCenterProfile, Profile, ProfileQuickPickItem } from '../../../helpers/interfaces';
import { VsCodeUtils } from '../../../helpers/vsCodeUtils';
import { Strings } from '../../../strings';
import { Command } from '../command';
import { AuthProvider } from '../../../constants';

export default class SwitchAccount extends Command {

    public async runNoClient(): Promise<boolean | void> {
        if (!await super.runNoClient()) {
            return false;
        }

        const profiles = await this.manager.appCenterAuth.getProfiles();
        if (profiles.length < 2) {
            return true;
        }

        const menuOptions: ProfileQuickPickItem[] = [];
        profiles.forEach(profile => {
            if (!profile.isActive) {
                menuOptions.push(<ProfileQuickPickItem>{
                    label: profile.userName,
                    description: "",
                    profile: profile
                });
            }
        });

        return await vscode.window.showQuickPick(menuOptions, { placeHolder: Strings.SelectProfileTitlePlaceholder })
            .then((selected: ProfileQuickPickItem) => {
                if (!selected) {
                    // User cancel selection
                    return true;
                }
                return this.switchActiveProfile(selected.profile);
            }, this.handleError);
    }

    private async switchActiveProfile(selectedProfile: Profile): Promise<boolean> {
        try {
            const currentActiveProfile: AppCenterProfile | null = this.manager.appCenterAuth.activeProfile;
            if (currentActiveProfile) {
                currentActiveProfile.isActive = false;
                await this.manager.appCenterAuth.updateProfile(currentActiveProfile);
            }
            selectedProfile.isActive = true;
            await this.manager.appCenterAuth.updateProfile(selectedProfile);

            VsCodeUtils.ShowInfoMessage(Strings.UserSwitchedMsg(AuthProvider.AppCenter, selectedProfile.userName));
            await this.manager.setupAppCenterStatusBar(selectedProfile);
        } catch (e) {
            this.handleError(e);
            return false;
        }
        return true;
    }

    private handleError(error: Error) {
        VsCodeUtils.ShowErrorMessage("Error occured during the switching accounts.");
        this.logger.error(error.message, error, true);
    }
}
