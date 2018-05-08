import { tokenStore } from "../data/tokenStore";
import { ILogger } from "../extension/log/logHelper";
import { LoginInfo, Profile, ProfileStorage } from "../helpers/interfaces";
import { LogStrings } from "../extension/resources/logStrings";

export default abstract class Auth<T extends Profile> {

    public constructor(
        protected profileStorage: ProfileStorage<T>,
        protected logger: ILogger) {
    }

    protected abstract async getUserInfo(credentials: LoginInfo): Promise<T>;

    public get activeProfile(): T | null {
        return this.profileStorage.activeProfile;
    }

    public async initialize(): Promise<void> {
        await this.profileStorage.init();
    }

    public async doLogin(loginInfo: LoginInfo): Promise<T | null> {
        const token: string = loginInfo.token;
        if (!token) {
            return null;
        }

        // Ask server for user info by token
        const profile: T = await this.getUserInfo(loginInfo);
        if (!profile) {
            this.logger.error(LogStrings.FailedToGetUserProfile);
            return null;
        }

        // Remove existent token for user from local store
        // TODO: Probably we need to delete token from server also?
        await tokenStore.remove(profile.userId);

        await tokenStore.set(profile.userId, { token: token });

        // Make it active
        profile.isActive = true;

        // Save it in local store
        await this.profileStorage.save(profile);
        return profile;
    }

    public async doLogout(userId: string): Promise<void> {

        // Remove token from local store
        // TODO: Probably we need to delete token from server also?
        await tokenStore.remove(userId);
        await this.profileStorage.delete(userId);

        // If there are no profiles left just exit
        const profiles: T[] | null = await this.profileStorage.list();
        if (profiles.length === 0) {
            return;
        }

        // If there is no active profile then choose first saved profile and make it active if possible
        if (!this.profileStorage.activeProfile) {
            const firstProfile = profiles[0];
            firstProfile.isActive = true;
            await this.profileStorage.save(firstProfile);
        }
    }

    public async updateProfile(profile: Profile): Promise<void> {
        await this.profileStorage.save(profile);
    }

    public async getProfiles(): Promise<T[]> {
        return await this.profileStorage.list();
    }

    public static accessTokenFor(profile: Profile): Promise<string> {
        const getter = tokenStore.get(profile.userId);
        const emptyToken = "";
        // tslint:disable-next-line:no-any
        return getter.then((entry: any) => {
            if (entry) {
                return entry.accessToken.token;
            }
            return emptyToken;
        }).catch((e: Error) => {
            // TODO Find a way to log it via logger
            console.error(LogStrings.FailedToGetToken, e);
            return emptyToken;
        });
    }
}
