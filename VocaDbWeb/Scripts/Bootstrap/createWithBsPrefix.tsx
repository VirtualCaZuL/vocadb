// Code from: https://github.com/react-bootstrap/react-bootstrap/blob/3d4c57374646949e6fedfef00236c99f4d1b4e71/src/createWithBsPrefix.tsx
import classNames from 'classnames';
import camelize from 'dom-helpers/camelize';
import * as React from 'react';

import { useBootstrapPrefix } from './ThemeProvider';
import { BsPrefixRefForwardingComponent } from './helpers';

const pascalCase = (str: any): string =>
	str[0].toUpperCase() + camelize(str).slice(1);

interface BsPrefixOptions<As extends React.ElementType = 'div'> {
	displayName?: string;
	Component?: As;
	defaultProps?: Partial<React.ComponentProps<As>>;
}

// TODO: emstricten & fix the typing here! `createWithBsPrefix<TElementType>...`
export default function createWithBsPrefix<
	As extends React.ElementType = 'div'
>(
	prefix: string,
	{
		displayName = pascalCase(prefix),
		Component,
		defaultProps,
	}: BsPrefixOptions<As> = {},
): BsPrefixRefForwardingComponent<As> {
	const BsComponent = React.forwardRef(
		(
			{ className, bsPrefix, as: Tag = Component || 'div', ...props }: any,
			ref,
		) => {
			const resolvedPrefix = useBootstrapPrefix(bsPrefix, prefix);
			return (
				<Tag
					ref={ref}
					className={classNames(className, resolvedPrefix)}
					{...props}
				/>
			);
		},
	);
	BsComponent.defaultProps = defaultProps as any;
	BsComponent.displayName = displayName;
	return BsComponent as any;
}
