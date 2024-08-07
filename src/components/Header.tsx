import {
  Container,
  Group,
  Menu,
  Avatar,
  Text,
  rem,
  Button,
  Loader,
  ActionIcon,
  Box,
  em,
} from "@mantine/core";

import { useMediaQuery } from "@mantine/hooks";

import { notifications } from "@mantine/notifications";

import {
  IconChevronDown,
  IconLogout,
  IconBrandGoogleFilled,
  IconMessageCircleQuestion,
  IconChecklist,
  IconLayoutKanban,
} from "@tabler/icons-react";

// import { useDisclosure } from "@mantine/hooks";
import { useState, lazy, Suspense } from "react";
import { ColorSchemeToggle } from "./ColorSchemeToggle";
import * as Auth from "../firebase/auth";
import { useAuthProvider } from "@/providers/AuthProvider";
import { upsertUser } from "@/dao/UserDao";
import Logo from "./Logo";
import { Role } from "@/db/constants";
import { modals } from "@mantine/modals";
import { Link, useMatch } from "react-router-dom";
import { createQuest, getQuest } from "@/dao/QuestDao";
import { UseFormReturnType } from "@mantine/form";
import { DocumentReference } from "firebase/firestore";
import { publish } from "@nucleoidai/react-event";
import { EVT_QUEST_CREATED } from "@/events";

// const user = {
//   name: "Jane Spoonfighter",
//   email: "janspoon@fighter.dev",
//   image:
//     "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-5.png",
// };

function UserMenu() {
  const [userMenuOpened, setUserMenuOpened] = useState(false);

  const { user, role } = useAuthProvider();

  const isMobile = useMediaQuery(`(max-width: ${em(750)})`);

  const logout = async () => {
    await Auth.signOut();
    notifications.show({
      title: "Logged out",
      message: "You have been successfully logged out",
      autoClose: 1000,
      color: "blue",
    });
  };

  const createNewQuestHandler = () => {
    const Form = lazy(() => import("@/fragments/CreateQuestsForm"));

    const submitHandler = async (values: any, form: UseFormReturnType<any>) => {
      createQuest(values).then(async (ref: DocumentReference) => {
        form.reset();
        // TODO: close current maybe
        modals.closeAll();
        notifications.show({
          title: "Quest created",
          message: "Quest has been created successfully",
          color: "green",
        });
        publish(EVT_QUEST_CREATED, await getQuest(ref.id));
      });
    };

    modals.open({
      title: "Create new quest",
      size: "xl",
      centered: true,
      children: (
        <Suspense>
          <Form submitHandler={submitHandler} />
        </Suspense>
      ),
    });
  };

  return (
    <Menu
      width={260}
      position="bottom-end"
      transitionProps={{ transition: "pop-top-right" }}
      onClose={() => setUserMenuOpened(false)}
      onOpen={() => setUserMenuOpened(true)}
      opened={userMenuOpened}
      withinPortal
    >
      <Menu.Target>
        <Box>
          {isMobile && (
            <ActionIcon size="lg" variant="default">
              <Avatar
                src={user!.photoURL!}
                alt={user!.displayName!}
                radius="xs"
              />
            </ActionIcon>
          )}
          {!isMobile && (
            <Button variant="default">
              <Group gap={7}>
                <Avatar
                  src={user!.photoURL!}
                  alt={user!.displayName!}
                  radius="xs"
                  size="sm"
                />
                <Text fw={500} size="sm" lh={1} mr={3}>
                  {user!.displayName}
                </Text>
                <IconChevronDown
                  style={{ width: rem(12), height: rem(12) }}
                  stroke={1.5}
                />
              </Group>
            </Button>
          )}
        </Box>
      </Menu.Target>
      <Menu.Dropdown>
        {role == "admin" && (
          <Box bg="blue" color="white" py="2px" fs="xs" ta="center">
            {role}
          </Box>
        )}

        {role == "admin" && (
          <Menu.Item
            onClick={createNewQuestHandler}
            leftSection={
              <IconMessageCircleQuestion
                style={{ width: rem(16), height: rem(16) }}
                stroke={1.5}
              />
            }
          >
            Create new quest
          </Menu.Item>
        )}

        <Menu.Item
          leftSection={
            <IconChecklist
              style={{ width: rem(16), height: rem(16) }}
              stroke={1.5}
            />
          }
          component={Link}
          to="/my-quests"
        >
          My Quests
        </Menu.Item>

        <Menu.Divider />
        <Menu.Item
          onClick={logout}
          leftSection={
            <IconLogout
              style={{ width: rem(16), height: rem(16) }}
              stroke={1.5}
            />
          }
        >
          Se Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

function SignInButton() {
  const initSignInFlow = async () => {
    try {
      const user = await Auth.signIn();

      if (!user) {
        notifications.show({
          title: "Failed to sign in",
          message: "Please try again",
          autoClose: 1000,
          color: "red",
        });

        return;
      }

      await upsertUser(user.uid, {
        schemaVersion: 1,
        uid: user.uid,
        displayName: user.displayName!,
        photoUrl: user.photoURL!,
        role: Role.user,
      });

      notifications.show({
        title: "Signed in",
        message: `Welcome back, ${user.displayName}`,
        autoClose: 1000,
        color: "green",
      });
    } catch (error) {
      console.error("Failed to sign in", error);
    }
  };

  return (
    <Button
      onClick={initSignInFlow}
      leftSection={<IconBrandGoogleFilled />}
      variant="light"
    >
      Sign In With Google
    </Button>
  );
}

function SelectBoardMenuItem({ to, name, description, icon }: any) {
  return (
    <Menu.Item component={Link} to={to}>
      <Group>
      {icon}
      <Box flex={1}>
      <Text size="sm" fw={500}>{name}</Text>
      <Text size="sm" c="dimmed">
        {description}
      </Text>
      </Box>
      </Group>
    </Menu.Item>
  );
}

function SelectBoardMenu() {

  const isQuests = useMatch("/quests");

  const currentBoard = isQuests ? "Quest Board" : "Proposals";

  return (
    <Menu
      position="bottom-start"
      transitionProps={{ transition: "pop-top-left" }}
      width={320}
      shadow="md"
    >
      <Menu.Target>
        <Button variant="outline" rightSection={<IconChevronDown />}>
          {currentBoard}
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <SelectBoardMenuItem
          to="/quests"
          name="Quest Board"
          description="Trinity needs your help, pick a quest to help us out!"
          icon={<IconLayoutKanban stroke={1.5}/>}
        />
        <SelectBoardMenuItem
          to="/proposals"
          name="Proposals"
          description="Contribute your ideas to make Trinity a better place"
          icon={<IconMessageCircleQuestion stroke={1.5}/>}
        />
      </Menu.Dropdown>
    </Menu>
  );
}

export default function Header() {
  // const [opened, { toggle }] = useDisclosure(false);

  const { user, loading } = useAuthProvider();

  const AwaitingAuthResultIndicator = () => (
    <ActionIcon variant="light" size="lg">
      <Loader size="xs" />
    </ActionIcon>
  );

  return (
    <Container size="xl">
      <Group justify="space-between" py="sm">
        <Group>
          <Logo />
          <SelectBoardMenu />
        </Group>

        {/* <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" /> */}
        <Group>
          {loading ? (
            <AwaitingAuthResultIndicator />
          ) : user ? (
            <UserMenu />
          ) : (
            <SignInButton />
          )}
          <ColorSchemeToggle />
        </Group>
      </Group>
    </Container>
  );
}
