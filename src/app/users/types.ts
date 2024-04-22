export const types=`#graphql
   type user{
    id:ID!
    firstName:String!
    lastName:String
    email:String!
    profileImageUrl:String
    tweets:[Tweet]
    follower:[user]
    following:[user]


}


`;