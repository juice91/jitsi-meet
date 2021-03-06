/* global APP, config, interfaceConfig, JitsiMeetJS */

import Button from '@atlaskit/button';
import { FieldTextStateless } from '@atlaskit/field-text';
import { AtlasKitThemeProvider } from '@atlaskit/theme';
import React from 'react';
import { connect } from 'react-redux';

import { initAnalytics } from '../../analytics';
import { translate } from '../../base/i18n';
import { isAnalyticsEnabled } from '../../base/lib-jitsi-meet';
import { Watermarks } from '../../base/react';

import { AbstractWelcomePage, _mapStateToProps } from './AbstractWelcomePage';

/**
 * The Web container rendering the welcome page.
 *
 * @extends AbstractWelcomePage
 */
class WelcomePage extends AbstractWelcomePage {
    /**
     * Initializes a new WelcomePage instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            ...this.state,

            generateRoomnames:
                interfaceConfig.GENERATE_ROOMNAMES_ON_WELCOME_PAGE
        };

        /**
         * The HTML Element used as the container for additional content. Used
         * for directly appending the additional content template to the dom
         *
         * @private
         * @type {HTMLTemplateElement|null}
         */
        this._additionalContentRef = null;

        /**
         * The template to use as the main content for the welcome page. If
         * not found then only the welcome page head will display.
         *
         * @private
         * @type {HTMLTemplateElement|null}
         */
        this._additionalContentTemplate = document.getElementById(
            'welcome-page-additional-content-template');

        // Bind event handlers so they are only bound once per instance.
        this._onRoomChange = this._onRoomChange.bind(this);
        this._setAdditionalContentRef
            = this._setAdditionalContentRef.bind(this);
    }

    /**
     * Implements React's {@link Component#componentDidMount()}. Invoked
     * immediately after this component is mounted.
     *
     * @inheritdoc
     * @returns {void}
     */
    componentDidMount() {
        // FIXME: This is not the best place for this logic. Ideally we should
        // use features/base/lib-jitsi-meet#initLib() action for this use case.
        // But currently lib-jitsi-meet#initLib()'s logic works for mobile only
        // (on web it ends up with infinite loop over initLib).
        JitsiMeetJS.init({
            enableAnalyticsLogging: isAnalyticsEnabled(APP.store),
            ...config
        }).then(() => {
            initAnalytics(APP.store);
        });

        if (this.state.generateRoomnames) {
            this._updateRoomname();
        }

        if (this._shouldShowAdditionalContent()) {
            this._additionalContentRef.appendChild(
                this._additionalContentTemplate.content.cloneNode(true));
        }
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement|null}
     */
    render() {
        const { t } = this.props;
        const { APP_NAME } = interfaceConfig;
        const showAdditionalContent = this._shouldShowAdditionalContent();

        return (
            <AtlasKitThemeProvider mode = 'light'>
                <div
                    className = { `welcome ${showAdditionalContent
                        ? 'with-content' : 'without-content'}` }
                    id = 'new_welcome_page'>
                    <div className = 'header'>
                      {/*  <div className = 'header-image' />
                        <Watermarks />*/}
                       {/* <div className = 'header-text'>
                            <h1 className = 'header-text-title'>
                                { t('welcomepage.title') }
                            </h1>
                            <p className = 'header-text-description'>
                                { t('welcomepage.appDescription',
                                    { app: APP_NAME }) }
                            </p>
                        </div>*/}
                        <div id = 'new_enter_room'>
                            <form
                                className = 'enter-room-input'
                                onSubmit = { this._onJoin }>
                                <FieldTextStateless
                                    autoFocus = { true }
                                    id = 'enter_room_field'
                                    isLabelHidden = { true }
                                    label = 'enter_room_field'
                                    onChange = { this._onRoomChange }
                                    placeholder = { this.state.roomPlaceholder }
                                    shouldFitContainer = { true }
                                    type = 'text'
                                    value = { this.state.room } />
                            </form>
                            <Button
                                appearance = 'primary'
                                className = 'welcome-page-button'
                                id = 'enter_room_button'
                                onClick = { this._onJoin }
                                type = 'button'>
                                { t('welcomepage.go') }
                            </Button>
                        </div>
                    </div>
                    { showAdditionalContent
                        ? <div
                            className = 'welcome-page-content'
                            ref = { this._setAdditionalContentRef } />
                        : null }
                </div>
            </AtlasKitThemeProvider>
        );
    }

    /**
     * Overrides the super to account for the differences in the argument types
     * provided by HTML and React Native text inputs.
     *
     * @inheritdoc
     * @override
     * @param {Event} event - The (HTML) Event which details the change such as
     * the EventTarget.
     * @protected
     */
    _onRoomChange(event) {
        super._onRoomChange(event.target.value);
    }

    /**
     * Sets the internal reference to the HTMLDivElement used to hold the
     * welcome page content.
     *
     * @param {HTMLDivElement} el - The HTMLElement for the div that is the root
     * of the welcome page content.
     * @private
     * @returns {void}
     */
    _setAdditionalContentRef(el) {
        this._additionalContentRef = el;
    }

    /**
     * Returns whether or not additional content should be displayed belowed
     * the welcome page's header for entering a room name.
     *
     * @private
     * @returns {boolean}
     */
    _shouldShowAdditionalContent() {
        return interfaceConfig.DISPLAY_WELCOME_PAGE_CONTENT
            && this._additionalContentTemplate
            && this._additionalContentTemplate.content
            && this._additionalContentTemplate.innerHTML.trim();
    }
}

export default translate(connect(_mapStateToProps)(WelcomePage));
