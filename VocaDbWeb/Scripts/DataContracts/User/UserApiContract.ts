import UserGroup from '@Models/Users/UserGroup';

import EntryThumbContract from '../EntryThumbContract';
import UserBaseContract from './UserBaseContract';

export default interface UserApiContract extends UserBaseContract {
	active?: boolean;

	groupId?: UserGroup;

	mainPicture?: EntryThumbContract;

	memberSince?: Date;
}
