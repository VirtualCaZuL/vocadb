import EntryThumbContract from '@DataContracts/EntryThumbContract';
import UrlHelper from '@Helpers/UrlHelper';
import ImageSize from '@Models/Images/ImageSize';
import React from 'react';

interface EntryPictureFileLinkProps {
	imageInfo: EntryThumbContract;
}

const EntryPictureFileLink = React.memo(
	({ imageInfo }: EntryPictureFileLinkProps): React.ReactElement => {
		return (
			<a href={UrlHelper.imageThumb(imageInfo, ImageSize.Original)}>
				<img
					src={UrlHelper.imageThumb(imageInfo, ImageSize.Thumb)}
					alt="Preview" /* TODO: localize */
					className="coverPic"
				/>
			</a>
		);
	},
);

export default EntryPictureFileLink;
