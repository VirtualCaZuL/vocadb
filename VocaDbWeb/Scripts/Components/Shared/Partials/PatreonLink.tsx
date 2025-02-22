import React from 'react';

const PatreonLink = React.memo(
	(): React.ReactElement => {
		return (
			<>
				<p>
					<small>{vdb.resources.layout.paypalDonateTitle}</small>
				</p>

				<a href={vdb.values.patreonLink} target="_blank" rel="noreferrer">
					<img
						src={'/Content/patreon.png'}
						alt="Support on Patreon"
						title="Support on Patreon"
					/>
				</a>
			</>
		);
	},
);

export default PatreonLink;
