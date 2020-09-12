<template>
	<section id="tomika-user-nintendo-connect">
		<transition :name="ninConnStep < ninConnPrevStep ? 'page-slide-right' : 'page-slide-left'" mode="out-in">
			<div class="nin-conn-step" v-if="ninConnStep === 0" key="0">
				<h1><div>Manual cookie insertion</div></h1>
				<tomika-block-message type="warning">Manual insertion of the cookie is not recommended as
					iksm_session cookies only last for 24 hours.</tomika-block-message>
				<p>Insert the FULL cookie in the input field below. Make sure to include the expiry time.</p>
				<div class="input-row">
					<input type="text" v-model="ninConnManualCookie">
					<button :disabled="$store.state.request.progress['/user/splatnet/cookie']" @click="ninConnManualConfirm">
						<font-awesome-icon :icon="$store.state.request.progress['/user/splatnet/cookie'] ? 'circle-notch' : 'save'"></font-awesome-icon>
						Save!
					</button>
				</div>
				<tomika-block-message type="error" v-if="ninConnManualCookieErr">
					{{ ninConnManualCookieErr }}
				</tomika-block-message>
				<p>Example: <span class="example">iksm_session=d3f852f1b181795bd1c643bff416e315a56a0c89; path=/;
							expires=Thu, 01-Jan-1970 00:00:00 GMT; secure; HttpOnly</span></p>
				<tomika-block-message v-if="$store.getters['user/splatnetConnected']" :type="$store.getters['user/splatnetCookieExpired'] ? 'error' : 'success'">
					{{ $store.getters['user/splatnetCookieExpired'] ? 'Your cookie has expired' : 'Your cookie has been saved and is ready for use' }}
				</tomika-block-message>
				<button v-if="$store.getters['user/splatnetConnected']" :disabled="$store.state.request.progress['/user/splatnet/disconnect']" @click="ninConnDisconnectButton">
					<font-awesome-icon :spin="$store.state.request.progress['/user/splatnet/disconnect']" :icon="$store.state.request.progress['/user/splatnet/disconnect'] ? 'circle-notch' : 'lock'"></font-awesome-icon>Delete cookie from server
				</button>
				<div class="nin-conn-step-changer-row">
					<div class="spacer"></div>
					<div class="nin-conn-step-changer right" @click="ninConnChangeStep(1)">
						<div>Connect Nintendo account to automatically generate a cookie</div>
						<font-awesome-icon icon="chevron-right"></font-awesome-icon>
					</div>
				</div>
			</div>
			<div class="nin-conn-step" v-if="ninConnStep === 1" key="1">
				<h1><div>About connecting your Nintendo account</div></h1>
				<p>Connect your Nintendo account to enable additional functionalities on Tomika.ink! Please read the
					following disclaimer before proceeding:</p>
				<p class="greyed">Connecting your Nintendo account to Tomika.ink involves a process not officially
					provided by Nintendo. Tomika.ink obtains a special cookie usually used exclusively on Splatnet 2. It
					then uses this cookie to obtain data available on Splatnet 2. When connecting your account,
					Tomika.ink does not have access to any sensitive data such as your email or passwords. I strongly
					recommend you read
					<a href="https://github.com/frozenpandaman/splatnet2statink#cookie-generation" target="_blank">the
						cookie generation section of splatnet2statink</a>, a library that uses the same process, to learn
					how and why this method is secure.</p>
				<p class="greyed">If you have concerns about automatic cookie generation, you may opt to obtain the
					cookie yourself (such as by using
					<a href="https://github.com/frozenpandaman/splatnet2statink/wiki/mitmproxy-instructions" target="_blank">mitmproxy</a>)
					and manually enter it yourself using method #2 below. Keep in mind however that iksm_session cookies
					only last for 24 hours, so you would need to generate a new one yourself.</p>
				<p class="greyed">If you have any additional concerns, you may contact me directly about them.
					Tomika.ink is not responsible for anything that may happen to your Nintendo account.</p>
				<div class="nin-conn-step-changer-row">
					<div class="nin-conn-step-changer" @click="ninConnChangeStep(0)" v-if="!$store.getters['user/splatnetConnectedAuto']">
						<font-awesome-icon icon="chevron-left"></font-awesome-icon>
						<div>Use manual cookie insertion instead</div>
					</div>
					<div class="spacer"></div>
					<div class="nin-conn-step-changer right" @click="ninConnChangeStep($store.getters['user/splatnetConnectedAuto'] ? 3 : 2)">
						<div>I have acknowledged and agree to these terms and wish to proceed</div>
						<font-awesome-icon icon="chevron-right"></font-awesome-icon>
					</div>
				</div>
			</div>
			<div class="nin-conn-step" v-if="ninConnStep === 2" key="2">
				<h1><div>Connecting your Nintendo account</div></h1>
				<p>Click on the button below to open the authorisation page on the Nintendo website. Sign in to
					your Nintendo account if you haven't already and <b>right-click on "Select this person",
						then press on "Copy link address"</b>.</p>
				<div class="nin-conn-button-row">
					<button class="nin-conn-auth-page-button" @click="clickNinConn">
						<font-awesome-icon :icon="['fa-tomika', 'nintendo-switch']"></font-awesome-icon>
						Open authorisation page
					</button>
				</div>
				<p>Paste the URL obtained in the input box below and press "Connect!":</p>
				<div class="input-row">
					<input type="text" v-model="ninConnRedirectUri">
					<button @click="clickNinConnRedirectSubmit" :disabled="$store.state.request.progress['/user/splatnet/connect-redirect']">
						<font-awesome-icon :spin="$store.state.request.progress['/user/splatnet/connect-redirect']"
							:icon="$store.state.request.progress['/user/splatnet/connect-redirect'] ? 'circle-notch' : 'lock-open'"></font-awesome-icon>
						Connect!
					</button>
				</div>
				<tomika-block-message v-if="ninConnRedirectErr" type="error">{{ ninConnRedirectErr }}</tomika-block-message>
				<div class="spacer"></div>
				<div class="nin-conn-step-changer-row">
					<div class="nin-conn-step-changer" @click="ninConnChangeStep(1)">
						<font-awesome-icon icon="chevron-left"></font-awesome-icon>
						<div>Read terms again</div>
					</div>
					<div class="spacer"></div>
					<div class="nin-conn-step-changer" @click="ninConnChangeStep(3)" v-if="$store.getters['user/splatnetConnectedAuto']">
						<div>Keep current connection</div>
						<font-awesome-icon icon="chevron-right"></font-awesome-icon>
					</div>
				</div>
			</div>
			<div class="nin-conn-step" v-if="ninConnStep === 3" key="3">
				<h1><div>Connection successful</div></h1>
				<p>Your Nintendo account is now connected! You will now be able to use any app on Tomika.ink
					that needs to access Splatnet 2!</p>
				<div class="nin-conn-button-row">
					<button :disabled="$store.state.request.progress['/user/splatnet/disconnect']" @click="ninConnChangeStep(2)">
						<font-awesome-icon icon="sync-alt"></font-awesome-icon>Reconnect
					</button>
					<button :disabled="$store.state.request.progress['/user/splatnet/disconnect']" @click="ninConnDisconnectButton">
						<font-awesome-icon :spin="$store.state.request.progress['/user/splatnet/disconnect']" :icon="$store.state.request.progress['/user/splatnet/disconnect'] ? 'circle-notch' : 'lock'"></font-awesome-icon>Disconnect
					</button>
				</div>
				<div class="spacer"></div>
				<div class="nin-conn-step-changer-row">
					<div class="nin-conn-step-changer" @click="ninConnChangeStep(1)">
						<font-awesome-icon icon="chevron-left"></font-awesome-icon>
						<div>Read terms again</div>
					</div>
				</div>
			</div>
		</transition>
	</section>
</template>

<script>
	// Import dependencies
	import { library } from '@fortawesome/fontawesome-svg-core';
	import { faChevronLeft, faChevronRight, faLockOpen, faCircleNotch, faSyncAlt, faLock, faSave } from '@fortawesome/free-solid-svg-icons';

	// Import components
	import tomikaBlockMessage from '../tomika-block-message';

	// Font awesome
	library.add(faChevronLeft, faChevronRight, faLockOpen, faCircleNotch, faSyncAlt, faLock, faSave);

	// Import requests
	import {
		userSplatnetConnectRedirectReq,
		userSplatnetManualCookieReq,
		userSplatnetDisconnectReq,
		userInfoReq
	} from "../../requests/user";

	export default {
		name: "tomika-user-nintendo-connect",
		components: {
			tomikaBlockMessage
		},
		data() {
			return {
				ninConnStep: 1,
				ninConnPrevStep: 0,
				ninConnManualCookie: '',
				ninConnManualCookieErr: '',
				ninConnRedirectUri: '',
				ninConnRedirectErr: ''
			}
		},
		computed: {
			ninConnManualMessage() {
				return this.$store.getters['user/splatnetConnected'];
			}
		},
		methods: {
			ninConnChangeStep(step) {
				this.ninConnPrevStep = this.ninConnStep;
				this.ninConnStep = step;
			},
			clickNinConn() {
				window.open(`${this.$store.state.app.backEnd}/user/splatnet/connect`);
			},
			async clickNinConnRedirectSubmit() {
				this.ninConnRedirectErr = '';
				if (this.ninConnRedirectUri) {
					let r = await userSplatnetConnectRedirectReq(this.ninConnRedirectUri);
					if (r === true) {
						this.ninConnChangeStep(3);
						this.ninConnRedirectUri = '';
					}
					else if (typeof r === 'object') {
						if (r.code === 'PARAM_INVALID_VALUE') {
							this.ninConnRedirectErr = 'Invalid URL. Please check the URL submitted was the correct one and was properly formed.';
						} else {
							this.ninConnRedirectErr = 'An unexpected error occurred. Please try again later.';
						}
					}
				}
			},
			async ninConnManualConfirm() {
				this.ninConnBadlyFormedCookie = false;
				this.ninConnAlreadyExpiredCookie = false;
				let r = await userSplatnetManualCookieReq(this.ninConnManualCookie);
				console.log(r);
				if (r === 'SPLATNET_COOKIE_BADLY_FORMED') { this.ninConnManualCookieErr = 'The cookie you entered is not properly formed. See below for an example.'; }
				if (r === 'SPLATNET_MANUAL_COOKIE_EXPIRED') { this.ninConnManualCookieErr = 'The cookie you entered has already expired.'; }
				else if (r !== true) { this.ninConnManualCookieErr = 'An unexpected error occurred.'; }
				else { await userInfoReq(); }
			},
			async ninConnDisconnectButton() {
				let r = await userSplatnetDisconnectReq();
				if (r) {
					this.ninConnChangeStep(1);
					await userInfoReq();
				}
			}
		},
		mounted() {
			// Choose the initial step based on the status of the user's connection
			if (this.$store.getters['user/splatnetConnected']) {
				if (this.$store.getters['user/splatnetManual']) {
					this.ninConnStep = 0;
					this.ninConnManualCookie = this.$store.getters['user/splatnetCookie'];
				} else {
					this.ninConnStep = 3;
				}
			} else {
				this.ninConnStep = 1;
			}
		}
	}
</script>

<style scoped>
#tomika-user-nintendo-connect {
	background: hsla(0,0%,0%,0.3);
	padding: 20px;
	border-radius: 8px;
	margin: 20px 0;
}
h1 {
	font-family: "Roboto Condensed", Arial, sans-serif;
	color: hsl(0,0%,80%);
	width: 100%;
	display: flex;
	flex-direction: row;
	justify-content: center;
	margin-top: 0;
	font-size: 1em;
}
h1 > div {
	display: inline-block;
	padding-bottom: 8px;
	border-bottom: 1px solid hsl(0,0%,40%);
}
section p {
	margin: 8px 0;
}
#tomika-user-nintendo-connect {
	overflow-x: hidden;
}
.nin-conn-step {
	display: flex;
	flex-direction: column;
}
.nin-conn-step > .spacer, .nin-conn-step-changer-row > .spacer {
	flex-grow: 1;
}
.nin-conn-step-changer {
	display: flex;
	flex-direction: row;
	align-items: center;
	color: hsl(0,0%,70%);
	margin-top: 8px;
	cursor: pointer;
	transition: background-color 100ms, color 100ms;
	padding: 8px;
	border-radius: 8px;
	align-self: flex-start;
}
.nin-conn-step-changer-row {
	display: flex;
}
.nin-conn-step-changer:hover {
	background-color: hsla(0,0%,100%,0.05);
	color: inherit;
}
.nin-conn-step-changer.right {
	text-align: right;
	color: inherit;
}
.nin-conn-step-changer > svg {
	margin: 0 12px;
}
.nin-conn-step-changer > div {
	max-width: 150px;
	font-size: 0.8em;
}
.input-row {
	display: flex;
	flex-direction: row;
	margin: 8px 0;
}
.input-row input[type=text] {
	background: transparent;
	margin-right: 8px;
	flex-grow: 1;
	color: inherit;
}
.example {
	font-family: "Courier New", monospace;
	word-break: break-word;
	color: hsla(0,0%,100%,0.8);
	font-size: 0.9em;
}
.nin-conn-button-row {
	margin: 8px 0;
	text-align: center;
}
.nin-conn-button-row > button {
	margin: 0 4px;
}
.nin-conn-auth-page-button {
	padding: 16px;
	font-size: 1.3em;
	background-color: #e60012;
}
.nin-conn-auth-page-button:hover:after {
	opacity: 0.2;
}
</style>