<template>
	<div class="game-details" :class="{ joinable: clickable && game.joinable, full: !game.joinable }">
		<ouistiti-player-graphic :id="game.hostId" :colour="game.hostColour"></ouistiti-player-graphic>
		<div class="game-middle-details">
			<div>{{ game.hostNickname }}</div>
			<div>
				<font-awesome-icon v-if="game.passwordProtected" icon="lock" style="margin-right: 4px;"></font-awesome-icon>
				<template v-if="game.inProgress">In progress - round {{ game.round }}/{{ game.totalRoundCount }}</template>
				<template v-else-if="game.joinable">Joinable<template v-if="game.passwordProtected"> - Password protected</template></template>
				<template v-else>Game full</template>
			</div>
		</div>
		<div class="game-player-count">
			<span>{{ game.playersCount }}</span><font-awesome-icon icon="users"></font-awesome-icon>
		</div>
	</div>
</template>

<script>
	import OuistitiPlayerGraphic from "./ouistiti-player-graphic";
	export default {
		name: "ouistiti-game-details",
		components: {
			OuistitiPlayerGraphic
		},
		props: ['game', 'clickable']
	}
</script>

<style scoped>
.game-details {
	display: flex;
	flex-direction: row;
	align-items: center;
	transition: background-color 100ms;
	border-radius: 8px;
	margin-bottom: 8px;
}
.joinable {
	cursor: pointer;
}
.joinable:hover {
	background-color: hsla(0,0%,100%,0.05);
}
.full {
	opacity: 0.5;
	cursor: not-allowed;
}
.game-middle-details {
	flex-grow: 1;
	padding: 0 12px;
}
.game-middle-details > div:nth-child(1) {
	font-weight: bold;
	font-size: 1.3em;
}
.game-middle-details > div:nth-child(2) {
	color: hsl(0,0%,60%);
}
.game-player-count {
	color: hsl(0,0%,80%);
	padding: 8px;
}
.game-player-count > span {
	font-weight: bold;
	margin: 0 4px;
}
</style>