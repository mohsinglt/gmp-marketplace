import React from 'react';
import { Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { propTypes } from '../../../util/types';
import * as validators from '../../../util/validators';
import { getPropsForCustomUserFieldInputs } from '../../../util/userHelpers';

import { Form, PrimaryButton, FieldTextInput, CustomExtendedDataField } from '../../../components';

import FieldSelectUserType from '../FieldSelectUserType';
import UserFieldDisplayName from '../UserFieldDisplayName';
import UserFieldPhoneNumber from '../UserFieldPhoneNumber';

import css from './SignupForm.module.css';

const getSoleUserTypeMaybe = userTypes =>
  Array.isArray(userTypes) && userTypes.length === 1 ? userTypes[0].userType : null;

const isPasswordUsedMoreThanOnce = formValues => {
  const pw = formValues.password;
  const hasPasswordString = pw != null && pw.length >= validators.PASSWORD_MIN_LENGTH;

  if (hasPasswordString) {
    const isPasswordRepeated = Object.values(formValues).filter(v => v === pw).length > 1;
    return isPasswordRepeated;
  }
  return false;
};

// Global Marketplace: the sign-up form can be split into steps. `steps` lists, per step, the
// custom user field keys shown there (step 0 always holds the account fields). Fields not
// listed go on the last step. "Continue" only moves on when the current step is valid.
const stepOfField = (steps, key) => {
  if (!steps) return 0;
  const i = steps.findIndex(keys => keys.includes(key));
  return i >= 0 ? i : steps.length - 1;
};
const ACCOUNT_FIELD_NAMES = [
  'email',
  'fname',
  'lname',
  'password',
  'displayName',
  'phoneNumber',
  'terms',
];

const SignupFormComponent = props => (
  <FinalForm
    {...props}
    mutators={{ ...arrayMutators }}
    initialValues={{ userType: props.preselectedUserType || getSoleUserTypeMaybe(props.userTypes) }}
    render={formRenderProps => {
      const {
        rootClassName,
        className,
        formId,
        handleSubmit,
        inProgress,
        invalid,
        intl,
        termsAndConditions,
        preselectedUserType,
        userTypes,
        userFields,
        values,
        form,
        steps,
        step = 0,
        onStepChange,
      } = formRenderProps;
      const stepCount = steps ? steps.length : 1;
      const currentStep = Math.min(step, stepCount - 1);
      const isLastStep = currentStep === stepCount - 1;

      const { userType } = values || {};

      // email
      const emailRequired = validators.required(
        intl.formatMessage({
          id: 'SignupForm.emailRequired',
        })
      );
      const emailValid = validators.emailFormatValid(
        intl.formatMessage({
          id: 'SignupForm.emailInvalid',
        })
      );

      // password
      const passwordRequiredMessage = intl.formatMessage({
        id: 'SignupForm.passwordRequired',
      });
      const passwordMinLengthMessage = intl.formatMessage(
        {
          id: 'SignupForm.passwordTooShort',
        },
        {
          minLength: validators.PASSWORD_MIN_LENGTH,
        }
      );
      const passwordMaxLengthMessage = intl.formatMessage(
        {
          id: 'SignupForm.passwordTooLong',
        },
        {
          maxLength: validators.PASSWORD_MAX_LENGTH,
        }
      );
      const passwordMinLength = validators.minLength(
        passwordMinLengthMessage,
        validators.PASSWORD_MIN_LENGTH
      );
      const passwordMaxLength = validators.maxLength(
        passwordMaxLengthMessage,
        validators.PASSWORD_MAX_LENGTH
      );
      const passwordRequired = validators.requiredStringNoTrim(passwordRequiredMessage);
      const passwordValidators = validators.composeValidators(
        passwordRequired,
        passwordMinLength,
        passwordMaxLength
      );

      // Custom user fields. Since user types are not supported here,
      // only fields with no user type id limitation are selected.
      const userFieldProps = getPropsForCustomUserFieldInputs(userFields, userType);

      const noUserTypes = !userType && !(userTypes?.length > 0);
      const userTypeConfig = userTypes.find(config => config.userType === userType);
      const showDefaultUserFields = userType || noUserTypes;
      const showCustomUserFields = (userType || noUserTypes) && userFieldProps?.length > 0;

      const stepFieldNames = i =>
        (i === 0 ? ACCOUNT_FIELD_NAMES : []).concat(
          (userFieldProps || [])
            .filter(f => stepOfField(steps, f.fieldConfig?.key) === i)
            .map(f => f.name)
        );
      const goToNextStep = () => {
        const errors = form.getState().errors || {};
        const invalidNames = stepFieldNames(currentStep).filter(n => errors[n]);
        if (invalidNames.length > 0) {
          invalidNames.forEach(n => {
            form.focus(n);
            form.blur(n);
          });
          return;
        }
        onStepChange(currentStep + 1);
        if (typeof window !== 'undefined') window.scrollTo(0, 0);
      };
      const goToPreviousStep = () => onStepChange(Math.max(currentStep - 1, 0));
      const onFormSubmit = e => {
        if (isLastStep) {
          return handleSubmit(e);
        }
        e.preventDefault();
        goToNextStep();
      };
      const hiddenUnless = i => (currentStep === i ? null : css.stepHidden);

      const classes = classNames(rootClassName || css.root, className);
      const submitInProgress = inProgress;
      const submitDisabled = invalid || submitInProgress || isPasswordUsedMoreThanOnce(values);

      return (
        <Form className={classes} onSubmit={onFormSubmit}>
          <FieldSelectUserType
            name="userType"
            userTypes={userTypes}
            hasExistingUserType={!!preselectedUserType}
            intl={intl}
          />

          {showDefaultUserFields ? (
            <div className={classNames(css.defaultUserFields, hiddenUnless(0))}>
              <FieldTextInput
                type="email"
                id={formId ? `${formId}.email` : 'email'}
                name="email"
                autoComplete="email"
                label={intl.formatMessage({
                  id: 'SignupForm.emailLabel',
                })}
                placeholder={intl.formatMessage({
                  id: 'SignupForm.emailPlaceholder',
                })}
                validate={validators.composeValidators(emailRequired, emailValid)}
              />
              <div className={css.name}>
                <FieldTextInput
                  className={css.firstNameRoot}
                  type="text"
                  id={formId ? `${formId}.fname` : 'fname'}
                  name="fname"
                  autoComplete="given-name"
                  label={intl.formatMessage({
                    id: 'SignupForm.firstNameLabel',
                  })}
                  placeholder={intl.formatMessage({
                    id: 'SignupForm.firstNamePlaceholder',
                  })}
                  validate={validators.required(
                    intl.formatMessage({
                      id: 'SignupForm.firstNameRequired',
                    })
                  )}
                />
                <FieldTextInput
                  className={css.lastNameRoot}
                  type="text"
                  id={formId ? `${formId}.lname` : 'lname'}
                  name="lname"
                  autoComplete="family-name"
                  label={intl.formatMessage({
                    id: 'SignupForm.lastNameLabel',
                  })}
                  placeholder={intl.formatMessage({
                    id: 'SignupForm.lastNamePlaceholder',
                  })}
                  validate={validators.required(
                    intl.formatMessage({
                      id: 'SignupForm.lastNameRequired',
                    })
                  )}
                />
              </div>

              <UserFieldDisplayName
                formName="SignupForm"
                className={css.row}
                userTypeConfig={userTypeConfig}
                intl={intl}
              />

              <FieldTextInput
                className={css.password}
                type="password"
                id={formId ? `${formId}.password` : 'password'}
                name="password"
                autoComplete="new-password"
                label={intl.formatMessage({
                  id: 'SignupForm.passwordLabel',
                })}
                placeholder={intl.formatMessage({
                  id: 'SignupForm.passwordPlaceholder',
                })}
                validate={passwordValidators}
              />

              <UserFieldPhoneNumber
                formName="SignupForm"
                className={css.row}
                userTypeConfig={userTypeConfig}
                intl={intl}
              />
            </div>
          ) : null}

          {showCustomUserFields ? (
            <div className={css.customFields}>
              {userFieldProps.map(({ key, ...fieldProps }) => (
                <div
                  key={key}
                  className={hiddenUnless(stepOfField(steps, fieldProps.fieldConfig?.key))}
                >
                  <CustomExtendedDataField {...fieldProps} formId={formId} />
                </div>
              ))}
            </div>
          ) : null}

          <div className={css.bottomWrapper}>
            <div className={hiddenUnless(0)}>{termsAndConditions}</div>
            {isPasswordUsedMoreThanOnce(values) ? (
              <div className={css.error}>
                <FormattedMessage id="SignupForm.passwordRepeatedOnOtherFields" />
              </div>
            ) : null}
            <div className={steps ? css.stepButtons : null}>
              {steps && currentStep > 0 ? (
                <button type="button" className={css.backButton} onClick={goToPreviousStep}>
                  <FormattedMessage id="GmpSignup.back" />
                </button>
              ) : null}
              {isLastStep ? (
                <PrimaryButton
                  type="submit"
                  inProgress={submitInProgress}
                  disabled={submitDisabled}
                >
                  <FormattedMessage id="SignupForm.signUp" />
                </PrimaryButton>
              ) : (
                <PrimaryButton type="button" onClick={goToNextStep}>
                  <FormattedMessage id="GmpSignup.continue" />
                </PrimaryButton>
              )}
            </div>
          </div>
        </Form>
      );
    }}
  />
);

/**
 * A component that renders the signup form.
 *
 * @component
 * @param {Object} props
 * @param {string} props.rootClassName - The root class name that overrides the default class css.root
 * @param {string} props.className - The class that extends the root class
 * @param {string} props.formId - The form id
 * @param {boolean} props.inProgress - Whether the form is in progress
 * @param {ReactNode} props.termsAndConditions - The terms and conditions
 * @param {string} props.preselectedUserType - The preselected user type
 * @param {propTypes.userTypes} props.userTypes - The user types
 * @param {propTypes.listingFields} props.userFields - The user fields
 * @param {Array<Array<string>>} [props.steps] - Optional: custom user field keys per step
 * @param {number} [props.step] - Optional: current step index
 * @param {Function} [props.onStepChange] - Optional: called with the next step index
 * @returns {JSX.Element}
 */
const SignupForm = props => {
  const intl = useIntl();
  return <SignupFormComponent {...props} intl={intl} />;
};

export default SignupForm;
