<template>
	<div id="tomika-content-user">
		<div>
			<div class="user-info-area">
				<tomika-discord-pfp size="128" :discord-id="$store.getters['user/discordId']"
					:avatar="$store.getters['user/avatar']"></tomika-discord-pfp>
				<div class="user-info-area-details">
					<div class="displayName">
						{{ $store.getters['user/name'] }}
						<span class="tag">#{{ $store.getters['user/discriminator'] }}</span>
					</div>
				</div>
			</div>
			<h1><div>Connect your Nintendo account</div></h1>
			<tomika-user-nintendo-connect></tomika-user-nintendo-connect>
			<h1><div>About your connection with your Discord account</div></h1>
			<section>
				<p class="greyed">The only data Tomika.ink collects from your Discord account is your Discord ID,
					username, discriminator (the 4 digit number after the #) and avatar. Tomika.ink has no access to
					your email, password or any other sensitive data. It cannot read your messages unless those messages
					originate from a server shared with the Tomika.ink bot. If you have any other privacy concerns, feel
					free to contact me.</p>
			</section>
		</div>
	</div>
</template>

<script>
	// Import components
	import tomikaDiscordPfp from '../wrappers/tomika-discord-pfp';
	import tomikaUserNintendoConnect from './tomika-user-nintendo-connect';

	export default {
		name: 'tomika-content-user',
		components: {
			tomikaDiscordPfp,
			tomikaUserNintendoConnect
		}
	}
</script>

<style scoped>
#tomika-content-user > div {
	width: 100%;
	max-width: 640px;
	padding: 20px;
}
.user-info-area {
	display: flex;
	flex-direction: row;
	align-items: center;
}
.user-info-area-details {
	display: flex;
	flex-direction: column;
	margin-left: 20px;
}
.user-info-area-details > .displayName {
	font-size: 32px;
}
.user-info-area-details > .displayName > .tag {
	color: hsl(0,0%,50%);
	font-size: 0.8em;
}
section {
	background: hsla(0,0%,0%,0.3);
	padding: 20px;
	border-radius: 8px;
	margin: 20px 0;
}
h1 {
	width: max-content;
	font-family: "Roboto Condensed", Arial, sans-serif;
	font-size: 16px;
	color: hsl(0,0%,80%);
}
h1 > div {
	display: inline-block;
	padding-bottom: 8px;
	border-bottom: 1px solid hsl(0,0%,40%);
}
section h1 {
	width: 100%;
	display: flex;
	flex-direction: row;
	justify-content: center;
	margin-top: 0;
	font-size: 1em;
}
section p {
	margin: 8px 0;
}
.greyed {
	font-size: 0.8em;
	color: hsl(0,0%,70%);
}
</style>