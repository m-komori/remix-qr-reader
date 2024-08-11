import { Flex, Button, AlertDialog } from "@radix-ui/themes";

type AlertModalProps = {
    onClose: (open: boolean) => void;
    isOpen: boolean;
    title: string;
    children: React.ReactNode;
};

const AlertModal = ({ onClose, isOpen, title, children }: AlertModalProps) => {
    return (
        <AlertDialog.Root open={isOpen} onOpenChange={onClose}>
            <AlertDialog.Content maxWidth="450px">
                <AlertDialog.Title>{title}</AlertDialog.Title>
                <AlertDialog.Description size="2">
                    {children}
                </AlertDialog.Description>

                <Flex gap="3" mt="4" justify="end">
                    <AlertDialog.Action>
                        <Button variant="solid" color="red">
                            OK
                        </Button>
                    </AlertDialog.Action>
                </Flex>
            </AlertDialog.Content>
        </AlertDialog.Root>
    );
};

export default AlertModal;
