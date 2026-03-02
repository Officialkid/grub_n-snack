import NextAuth, { CredentialsSignin } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

class InvalidCredentials extends CredentialsSignin {
  code = 'invalid_credentials'
}

class AccountDeactivated extends CredentialsSignin {
  code = 'account_deactivated'
}

class PendingApproval extends CredentialsSignin {
  code = 'pending_approval'
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.name = user.name
        token.phone = user.phone
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.name = token.name as string
        session.user.phone = token.phone as string
      }
      return session
    },
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        identifier: { label: 'Phone or Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          throw new InvalidCredentials()
        }

        const identifier = credentials.identifier as string

        // Look up by email OR phone
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: identifier },
              { phone: identifier },
            ],
          },
        })

        if (!user) {
          throw new InvalidCredentials()
        }

        if (user.isPendingApproval) {
          throw new PendingApproval(
            'Your account is pending admin approval. You will be notified once approved.'
          )
        }

        if (!user.isActive) {
          throw new AccountDeactivated()
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!passwordMatch) {
          throw new InvalidCredentials()
        }

        return {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
})
