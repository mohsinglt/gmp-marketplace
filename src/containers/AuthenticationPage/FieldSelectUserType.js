import React from 'react';
import { Field } from 'react-final-form';
import classNames from 'classnames';

import { intlShape } from '../../util/reactIntl';
import { propTypes } from '../../util/types';
import * as validators from '../../util/validators';

import css from './AuthenticationPage.module.css';

// Hidden input field
const FieldHidden = props => {
  const { name } = props;
  return (
    <Field id={name} name={name} type="hidden" className={css.unitTypeHidden}>
      {fieldRenderProps => <input {...fieldRenderProps?.input} />}
    </Field>
  );
};

/**
 * Return React Final Form Field that allows selecting user type.
 *
 * @component
 * @param {Object} props
 * @param {string} props.rootClassName - The root class that overrides the default class css.userTypeSelect
 * @param {string} props.className - The class that extends the root class
 * @param {string} props.name - The name of the field / input
 * @param {Array<propTypes.userType>} props.userTypes - The user types
 * @param {boolean} props.hasExistingUserType - Whether the user type already exists
 * @param {intlShape} props.intl - The intl object
 * @returns {JSX.Element}
 */
const FieldSelectUserType = props => {
  const { className, name, userTypes, hasExistingUserType, intl } = props;
  const hasMultipleUserTypes = userTypes?.length > 1;

  // Global Marketplace: user types are picked from three cards instead of a dropdown.
  const requiredMessage = intl.formatMessage({ id: 'FieldSelectUserType.required' });
  const describe = type => {
    const id = `GmpAuth.userType.${type}`;
    const text = intl.formatMessage({ id, defaultMessage: ' ' }).trim();
    return text && text !== id ? text : null;
  };

  return hasMultipleUserTypes && !hasExistingUserType ? (
    <fieldset className={classNames(css.userTypeCards, className)}>
      <legend className={css.userTypeLegend}>
        {intl.formatMessage({ id: 'GmpAuth.joiningAs' })}
      </legend>
      <div className={css.userTypeGrid}>
        {userTypes.map(config => {
          const type = config.userType;
          const description = describe(type);
          return (
            <Field
              key={type}
              name={name}
              type="radio"
              value={type}
              validate={validators.required(requiredMessage)}
            >
              {({ input }) => (
                <label
                  className={classNames(css.userTypeCard, {
                    [css.userTypeCardSelected]: input.checked,
                  })}
                >
                  <input {...input} id={`${name}-${type}`} className={css.userTypeRadio} />
                  <span className={css.userTypeTitle}>{config.label}</span>
                  {description ? <span className={css.userTypeText}>{description}</span> : null}
                </label>
              )}
            </Field>
          );
        })}
      </div>
    </fieldset>
  ) : (
    <>
      <FieldHidden name={name} />
    </>
  );
};

export default FieldSelectUserType;
