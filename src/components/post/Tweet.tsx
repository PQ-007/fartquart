/* eslint-disable @next/next/no-img-element */
import styles from "./Tweet.module.css"
import { SlidingText } from "../SlidingText"
import { HeartIcon, PlayIcon, RetweetIcon, VerifiedIcon } from "../icons"

export const Tweet = ({
  content,
  user,
  image,
  date,
  link,
  likes,
  retweets,
}: {
  content: string
  user: {
    username: string
    name: string
    isVerified?: boolean
    avatar: string
  }
  image?: {
    src: string
    alt: string
    width?: number
    height?: number
    isVideo?: boolean
  }
  date?: string
  link?: string
  likes?: number
  retweets?: number
}) => {
  const tweetUrl = `https://x.com/${user.username}/status/${link}`

  return (
    <div className={styles.wrapper}>
      <header>
        <a href={`https://x.com/${user.username}`} target="_blank" rel="noreferrer">
          <img src={user.avatar} alt="profile picture" width={48} height={48} />
          <div className={styles.user}>
            <p>
              {user.name} {user.isVerified && <VerifiedIcon />}
            </p>
            <p>@{user.username}</p>
          </div>
        </a>
      </header>
      <section className={styles.contentWrapper}>
        <p className={styles.content}>{content}</p>
        {image && (
          <a href={tweetUrl} target="_blank" rel="noreferrer">
            <section className={styles.imageWrapper}>
              <img
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
              />
              {image.isVideo && (
                <div className={styles.overlay}>
                  <div>
                    <PlayIcon />
                  </div>
                </div>
              )}
            </section>
          </a>
        )}
        {date && <p className={styles.date}>{date}</p>}
      </section>
      <footer className={styles.footer}>
        <button className={styles.likes} type="button">
          <HeartIcon />
          <p>{likes}</p>
        </button>
        <button className={styles.retweets} type="button">
          <RetweetIcon />
          <p>{retweets}</p>
        </button>
        <div>
          <a href={tweetUrl} target="_blank" rel="noopener noreferrer">
            <SlidingText text="View Tweet" arrow />
          </a>
        </div>
      </footer>
    </div>
  )
}
