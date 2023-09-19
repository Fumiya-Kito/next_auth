import getCurrnetUser from "./actions/getCurrentUser";

const Home = async () => {
  const currnetUser = await getCurrnetUser();

  return(
    <div className="text-center">
      {currnetUser ? <div>認証中</div> : <div>未認証</div>}
    </div>
  )
}

export default Home;