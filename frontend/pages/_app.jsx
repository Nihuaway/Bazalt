
import { Provider, useDispatch, useSelector } from 'react-redux'
import RootLayout from '../layouts/layout'
import { store } from '../store/store'
import '../styles/global.css'
import AuthRoute from '../routes/authRoute'
import { useEffect } from 'react'
import { setUser, unauthorized } from '../store/slices/userSlice'
import { io } from 'socket.io-client'
import { socketConnect } from '../store/slices/socketSlice'
import { Providers } from '../layouts/providers'
import { Middlewares } from '../layouts/middlewares'
import { AesCryptoHandler } from '../handlers/cryptoHandler'
import { addMessageAction } from '../store/slices/messageSlice'


export default function MyApp({ Component, pageProps }) {
	const dispatch = store.dispatch

	useEffect(() => {
		const sessionID = localStorage.getItem("sessionID")
		if (!sessionID) return

		const onRefresh = async () => await AuthRoute.refresh()

		onRefresh().then(({ data }) => {
			dispatch(setUser(data.user))
		}).catch(err => {
			dispatch(unauthorized())
			alert('refresh:' + err.message)
		})

		const socket = io("http://localhost:8000", {
			extraHeaders: { sessionID }
		})

		socket.on('SERVER:message', async ({ encrypted, iv, chatID }) => {

			const chats = store.getState().chats
			const chat = chats.filter(chat => chat._id === chatID)[0]
			const aes = new AesCryptoHandler()
			await aes.importKey('jwk', chat.key)
			const decrypted = await aes.decrypt(
				new Uint8Array(encrypted.split(",")),
				new Uint8Array(iv.split(","))
			)
			const data = JSON.parse(decrypted)

			store.dispatch(addMessageAction(data))
		})
	}, [])

	return (
		<Providers>
			<RootLayout>
				<Middlewares>
					<Component {...pageProps} />
				</Middlewares>
			</RootLayout>

		</Providers>

	)
}
