// Code from: https://github.com/react-bootstrap/react-bootstrap/blob/3d4c57374646949e6fedfef00236c99f4d1b4e71/src/Container.tsx
import classNames from 'classnames';
import PropTypes from 'prop-types';
import * as React from 'react';

import { useBootstrapPrefix } from './ThemeProvider';
import { BsPrefixProps, BsPrefixRefForwardingComponent } from './helpers';

export interface ContainerProps
	extends BsPrefixProps,
		React.HTMLAttributes<HTMLElement> {
	fluid?: boolean | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
}

const containerSizes = PropTypes.oneOfType([
	PropTypes.bool,
	PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'xxl']),
]);

const propTypes = {
	/**
	 * @default 'container'
	 */
	bsPrefix: PropTypes.string,

	/**
	 * Allow the Container to fill all of its available horizontal space.
	 * @type {(true|"sm"|"md"|"lg"|"xl"|"xxl")}
	 */
	fluid: containerSizes,
	/**
	 * You can use a custom element for this component
	 */
	as: PropTypes.elementType,
};

const defaultProps = {
	fluid: false,
};

const Container: BsPrefixRefForwardingComponent<
	'div',
	ContainerProps
> = React.forwardRef<HTMLElement, ContainerProps>(
	(
		{
			bsPrefix,
			fluid,
			// Need to define the default "as" during prop destructuring to be compatible with styled-components github.com/react-bootstrap/react-bootstrap/issues/3595
			as: Component = 'div',
			className,
			...props
		},
		ref,
	) => {
		const prefix = useBootstrapPrefix(bsPrefix, 'container');
		const suffix = typeof fluid === 'string' ? `-${fluid}` : '-fluid';
		return (
			<Component
				ref={ref}
				{...props}
				className={classNames(className, fluid ? `${prefix}${suffix}` : prefix)}
			/>
		);
	},
);

Container.displayName = 'Container';
Container.propTypes = propTypes;
Container.defaultProps = defaultProps;

export default Container;
